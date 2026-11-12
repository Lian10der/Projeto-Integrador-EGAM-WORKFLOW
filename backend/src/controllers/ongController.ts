import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { somenteDigitos, formatarCnpj, cnpjValido, consultarCnpj } from '../services/cnpj.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cliente separado para os fluxos de login, para não misturar sessões.
function novoClienteAuth() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function buscarContaPorEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => (u.email ?? '').toLowerCase() === email) ?? null;
}

// Se a Receita informar um e-mail, o domínio digitado precisa ser o mesmo.
// Isso ajuda a garantir que o e-mail é da organização.
function dominioCombina(emailDigitado: string, emailReceita: string | null): boolean {
  if (!emailReceita) return true;
  const dominio = (e: string) => e.trim().split('@')[1]?.toLowerCase() ?? '';
  const permitidos = emailReceita.split(/[;,]/).map(dominio);
  return permitidos.includes(dominio(emailDigitado));
}

// POST /ong/solicitar-codigo  { cnpj, email }
export async function solicitarCodigo(req: Request, res: Response) {
  try {
    const digitos = somenteDigitos(String(req.body?.cnpj ?? ''));
    const email = String(req.body?.email ?? '').trim().toLowerCase();

    if (!cnpjValido(digitos)) {
      return res.status(400).json({ error: 'CNPJ inválido. Confira os 14 números.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }

    let empresa: Awaited<ReturnType<typeof consultarCnpj>>;
    try {
      empresa = await consultarCnpj(digitos);
    } catch (err: any) {
      if (err.code === 'NAO_ENCONTRADO') {
        return res.status(400).json({ error: 'CNPJ não encontrado na Receita Federal.' });
      }
      return res.status(503).json({ error: 'Não foi possível consultar o CNPJ agora. Tente novamente.' });
    }

    if (empresa.situacao !== 'ATIVA') {
      return res.status(400).json({ error: 'Este CNPJ não está ativo na Receita Federal.' });
    }

    if (!dominioCombina(email, empresa.email)) {
      return res.status(400).json({
        error: 'Use o e-mail institucional da organização, cadastrado na Receita Federal.',
      });
    }

    const cnpjFormatado = formatarCnpj(digitos);
    const conta = await buscarContaPorEmail(email);

    if (conta) {
      // Já existe: só deixa entrar se for a mesma ONG (mesmo CNPJ).
      const meta = (conta.app_metadata ?? {}) as { papel?: string; cnpj?: string };
      const mesmaOng = meta.papel === 'ong' && somenteDigitos(String(meta.cnpj ?? '')) === digitos;
      if (!mesmaOng) {
        return res.status(403).json({ error: 'Este e-mail não pode ser usado para acessar como ONG.' });
      }
    } else {
      // Primeira vez: cria a conta de ONG já com papel e CNPJ.
      const { error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        app_metadata: { papel: 'ong', cnpj: cnpjFormatado, razao_social: empresa.razao_social },
      });
      if (error) {
        return res.status(400).json({ error: 'Não foi possível criar o acesso. Tente novamente.' });
      }
    }

    // Envia o código. shouldCreateUser: false garante que só contas já criadas recebem.
    const { error: erroOtp } = await novoClienteAuth().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (erroOtp) {
      return res.status(400).json({ error: 'Não foi possível enviar o código. Aguarde um pouco e tente de novo.' });
    }

    return res.json({
      message: 'Código enviado para o e-mail informado.',
      razao_social: empresa.razao_social,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao solicitar o código.' });
  }
}

// POST /ong/verificar-codigo  { email, codigo }
export async function verificarCodigo(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const codigo = somenteDigitos(String(req.body?.codigo ?? ''));

    if (!EMAIL_REGEX.test(email) || codigo.length !== 6) {
      return res.status(400).json({ error: 'Informe o e-mail e o código de 6 números.' });
    }

    const { data, error } = await novoClienteAuth().auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    });

    if (error || !data.session || !data.user) {
      return res.status(401).json({ error: 'Código inválido ou expirado.' });
    }

    const meta = (data.user.app_metadata ?? {}) as { papel?: string; cnpj?: string; razao_social?: string };
    if (meta.papel !== 'ong') {
      return res.status(403).json({ error: 'Este acesso não é de uma ONG.' });
    }

    return res.json({
      token: data.session.access_token,
      ong: {
        email: data.user.email,
        cnpj: meta.cnpj ?? null,
        razao_social: meta.razao_social ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao verificar o código.' });
  }
}

// GET /ong/me
export function me(_req: Request, res: Response) {
  return res.json({
    email: res.locals.authUser?.email ?? '',
    cnpj: res.locals.cnpj,
    razao_social: res.locals.razaoSocial,
  });
}

// Garante que o projeto pertence à ONG logada. Se não pertencer, responde 404
// (assim a ONG não descobre que o projeto existe).
export async function projetoDaOng(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  const cnpjOng = somenteDigitos(String(res.locals.cnpj ?? ''));

  if (!Number.isInteger(id) || id <= 0 || !cnpjOng) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }

  const { data, error } = await supabase
    .from('projetos')
    .select('id, cnpj')
    .eq('id', id)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });

  if (!data || somenteDigitos(String(data.cnpj ?? '')) !== cnpjOng) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }

  return next();
}

// GET /ong/projetos: só os projetos com o CNPJ da ONG logada.
export async function listarProjetosOng(_req: Request, res: Response) {
  const cnpjOng = somenteDigitos(String(res.locals.cnpj ?? ''));

  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .order('id', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const meus = (data ?? []).filter((p) => somenteDigitos(String(p.cnpj ?? '')) === cnpjOng);
  return res.json(meus);
}

// Na criação, o CNPJ é sempre o da ONG logada. O status também não vem do cliente.
export function forcarCnpjDaOng(req: Request, res: Response, next: NextFunction) {
  req.body = {
    ...(req.body ?? {}),
    cnpj: formatarCnpj(String(res.locals.cnpj ?? '')),
    status: undefined,
  };
  return next();
}

// Na edição, a ONG não pode trocar o CNPJ nem o status.
export function removerCamposProtegidos(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    delete req.body.cnpj;
    delete req.body.status;
  }
  return next();
}
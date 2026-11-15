import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { somenteDigitos, formatarCnpj, cnpjValido } from '../services/cnpj.js';

async function buscarContaPorEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => (u.email ?? '').toLowerCase() === email) ?? null;
}

export function me(_req: Request, res: Response) {
  return res.json({
    email: res.locals.authUser?.email ?? '',
    cnpj: res.locals.cnpj,
    razao_social: res.locals.razaoSocial,
  });
}

// Garante que o projeto pertence à ONG logada.
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

export async function listarProjetosOng(_req: Request, res: Response) {
  const cnpjOng = somenteDigitos(String(res.locals.cnpj ?? ''));

  if (!cnpjOng) {
    return res.status(400).json({ error: 'CNPJ da ONG não encontrado na sessão.' });
  }

  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .eq('cnpj', formatarCnpj(cnpjOng))
    .order('id', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  return res.json(data ?? []);
}

// Na criação, o CNPJ é sempre o da ONG logada.
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

export async function listarTodasOngs(req: Request, res: Response) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return res.status(400).json({ error: error.message });

    const ongs = data.users
      .filter((u) => {
        const meta = (u.app_metadata ?? {}) as any;
        return meta.papel === 'ong';
      })
      .map((u) => ({
        id: u.id,
        nome: u.app_metadata?.razao_social ?? 'Sem nome',
        email: u.email,
        cnpj: u.app_metadata?.cnpj,
        status: u.app_metadata?.status_aprovacao ?? 'PENDENTE',
        criado_em: u.created_at,
      }));

    return res.json(ongs);
  } catch {
    return res.status(500).json({ error: 'Erro ao listar ONGs.' });
  }
}

export async function criarOngComSenha(req: Request, res: Response) {
  try {
    const { nome, email, senha, cnpj } = req.body;

    if (!nome || !email || !senha || !cnpj) {
      return res.status(400).json({ error: 'Nome, e-mail, senha e CNPJ são obrigatórios.' });
    }

    const cnpjFormatado = formatarCnpj(somenteDigitos(cnpj));

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      app_metadata: {
        papel: 'ong',
        cnpj: cnpjFormatado,
        razao_social: nome,
        status_aprovacao: 'APROVADA',
      },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    return res.status(201).json({ message: 'ONG criada com sucesso.', email });
  } catch {
    return res.status(500).json({ error: 'Erro ao criar ONG.' });
  }
}

export async function editarOng(req: Request, res: Response) {
  try {
    const email = String(req.params.email ?? '').trim().toLowerCase();
    const { nome, cnpj, status } = req.body;

    const conta = await buscarContaPorEmail(email);
    if (!conta) return res.status(404).json({ error: 'ONG não encontrada.' });

    const { error } = await supabase.auth.admin.updateUserById(conta.id, {
      app_metadata: {
        ...conta.app_metadata,
        razao_social: nome,
        cnpj: formatarCnpj(somenteDigitos(cnpj)),
        status_aprovacao: status,
      },
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'ONG atualizada com sucesso.' });
  } catch {
    return res.status(500).json({ error: 'Erro ao editar ONG.' });
  }
}

export async function excluirOng(req: Request, res: Response) {
  try {
    const email = String(req.params.email ?? '').trim().toLowerCase();
    const conta = await buscarContaPorEmail(email);
    if (!conta) return res.status(404).json({ error: 'ONG não encontrada.' });

    const { error } = await supabase.auth.admin.deleteUser(conta.id);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Erro ao excluir ONG.' });
  }
}

export async function redefinirSenhaOng(req: Request, res: Response) {
  try {
    const email = String(req.params.email ?? '').trim().toLowerCase();
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const conta = await buscarContaPorEmail(email);
    if (!conta) return res.status(404).json({ error: 'ONG não encontrada.' });

    const meta = (conta.app_metadata ?? {}) as { papel?: string };
    if (meta.papel !== 'ong') {
      return res.status(403).json({ error: 'Este e-mail não pertence a uma ONG.' });
    }

    const { error } = await supabase.auth.admin.updateUserById(conta.id, {
      password: novaSenha,
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Senha redefinida com sucesso. Informe a nova senha à ONG.' });
  } catch {
    return res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
}
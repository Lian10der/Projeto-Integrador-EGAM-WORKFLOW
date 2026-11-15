import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const STATUS_VALIDOS = ['rascunho', 'submetido', 'em_analise', 'aprovado', 'reprovado'];

const ORDENS: Record<string, { coluna: string; ascending: boolean } | undefined> = {
  ranking: { coluna: 'classificacao_ranking', ascending: false },
  valor: { coluna: 'valor_solicitado', ascending: true },
};

function lerTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Remove caracteres com significado no filtro .or() do PostgREST.
function limparBusca(valor: string): string {
  return valor.replace(/[,()%*]/g, ' ').trim();
}

export async function listarProjetos(req: Request, res: Response) {
  try {
    const busca = limparBusca(lerTexto(req.query.busca));
    const status = lerTexto(req.query.status);
    const area = limparBusca(lerTexto(req.query.area));
    const leiId = lerTexto(req.query.lei_incentivo_id);
    const ordem = lerTexto(req.query.ordem) || 'ranking';

    if (status && !STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const criterio = ORDENS[ordem];
    if (!criterio) {
      return res.status(400).json({ error: 'Ordenação inválida.' });
    }

    let query = supabase.from('projetos').select('*');

    if (busca) {
      query = query.or(`titulo.ilike.%${busca}%,razao_social.ilike.%${busca}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (area) {
      query = query.ilike('area_atuacao', `%${area}%`);
    }
    if (leiId) {
      query = query.eq('lei_incentivo_id', Number(leiId));
    }

    query = query.order(criterio.coluna, {
      ascending: criterio.ascending,
      nullsFirst: false,
    });

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
}

export async function buscarProjetoPorId(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    if (!/^\d+$/.test(id)) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Projeto não encontrado.' });

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// Gera um protocolo único baseado no ano e na contagem de projetos.
async function gerarProtocolo(): Promise<string> {
  const ano = new Date().getFullYear();
  const { count } = await supabase
    .from('projetos')
    .select('*', { count: 'exact', head: true });
  
  const sequencial = String((count ?? 0) + 1).padStart(4, '0');
  return `IGAM-${ano}-${sequencial}`;
}

export async function criarProjeto(req: Request, res: Response) {
  try {
    const dados = req.body ?? {};

    const titulo = lerTexto(dados.titulo);
    const cnpj = lerTexto(dados.cnpj);

    if (!titulo || !cnpj) {
      return res.status(400).json({
        error: 'Campos obrigatórios (título, cnpj) não preenchidos.',
      });
    }

    const protocolo = await gerarProtocolo();

    const { data, error } = await supabase
      .from('projetos')
      .insert([
        {
          protocolo,
          cnpj,
          titulo,
          status: 'rascunho',
          area_atuacao: dados.area_atuacao ?? null,
          impacto_social: dados.impacto_social ?? null,
          lei_incentivo_id: dados.lei_incentivo_id ? Number(dados.lei_incentivo_id) : null,
          razao_social: dados.razao_social ?? null,
          tipo_entidade: dados.tipo_entidade ?? null,
          estado: dados.estado ?? null,
          cidade: dados.cidade ?? null,
          nome_responsavel: dados.nome_responsavel ?? null,
          email_contato: dados.email_contato ?? null,
          telefone: dados.telefone ?? null,
          site_url: dados.site_url ?? null,
          sobre_instituicao: dados.sobre_instituicao ?? null,
          valor_total: dados.valor_total ? Number(dados.valor_total) : null,
          teto_captacao: dados.teto_captacao ? Number(dados.teto_captacao) : null,
          valor_solicitado: dados.valor_solicitado ? Number(dados.valor_solicitado) : null,
          justificativa_pedido: dados.justificativa_pedido ?? null,
          objetivo: dados.objetivo ?? null,
          pessoas_alcancadas_estimativa: dados.pessoas_alcancadas_estimativa ? Number(dados.pessoas_alcancadas_estimativa) : null,
          pessoas_alcancadas_comprovadas: dados.pessoas_alcancadas_comprovadas ? Number(dados.pessoas_alcancadas_comprovadas) : null,
          data_inicio_analise: dados.data_inicio_analise || null,
          data_fim_analise: dados.data_fim_analise || null,
          data_inicio_execucao: dados.data_inicio_execucao || null,
          data_fim_execucao: dados.data_fim_execucao || null,
          tags: dados.tags ?? null,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      message: 'Projeto criado com sucesso.',
      data: data[0],
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// Define as transições permitidas a partir de cada status.
// Se um status não estiver no mapa, ele é final (ex: aprovado, reprovado) e não pode mudar.
const TRANSICOES_VALIDAS: Record<string, string[]> = {
  rascunho: ['submetido'],
  submetido: ['em_analise', 'reprovado'],
  em_analise: ['aprovado', 'reprovado'],
};

export async function atualizarStatusHistorico(req: Request, res: Response) {
  try {
    const dados = req.body ?? {};
    const projetoId = String(req.params.id ?? dados.id ?? '');
    const statusNovo = lerTexto(dados.status_novo);
    const observacao = dados.observacao ?? null;
    
    // O usuário logado vem do token, nunca do corpo da requisição.
    const authUser = res.locals.authUser as { id: string } | undefined;
    const usuarioId = authUser?.id ?? null;

    if (!projetoId || !statusNovo) {
      return res.status(400).json({ error: 'ID do projeto e status_novo são obrigatórios.' });
    }

    if (!STATUS_VALIDOS.includes(statusNovo)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const { data: projetoAtual, error: errBusca } = await supabase
      .from('projetos')
      .select('status')
      .eq('id', projetoId)
      .single();

    if (errBusca) return res.status(404).json({ error: 'Projeto não encontrado.' });

    const statusAnterior = projetoAtual.status as string;

    const permitidos = TRANSICOES_VALIDAS[statusAnterior] ?? [];
    if (!permitidos.includes(statusNovo)) {
      return res.status(400).json({ 
        error: `Transição inválida: não é possível ir de "${statusAnterior}" para "${statusNovo}".` 
      });
    }

    // Prepara os dados da atualização. Se for a primeira submissão, preenche a data.
    const dadosAtualizacao: Record<string, unknown> = {
      status: statusNovo,
      data_atualizacao: new Date(),
    };
    
    if (statusAnterior === 'rascunho' && statusNovo === 'submetido') {
      dadosAtualizacao.data_submissao = new Date();
    }

    const { data: projetoAtualizado, error: errUpdate } = await supabase
      .from('projetos')
      .update(dadosAtualizacao)
      .eq('id', projetoId)
      .select();

    if (errUpdate) return res.status(400).json({ error: errUpdate.message });

    const { error: errHistorico } = await supabase.from('historico_status').insert([
      {
        projeto_id: projetoId,
        usuario_id: usuarioId,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        observacao,
        data_transicao: new Date(),
      },
    ]);

    if (errHistorico) return res.status(400).json({ error: errHistorico.message });

    return res.status(200).json({
      message: 'Status atualizado e histórico registrado com sucesso.',
      data: projetoAtualizado,
    });
  } catch {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function listarLeis(req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('leis_incentivo')
      .select('id, nome, esfera, status')
      .eq('status', 'ATIVA')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar leis.' });
  }
}

export async function atualizarStatusKanban(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    const statusValidos = ['rascunho', 'submetido', 'em_analise', 'aprovado', 'reprovado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const { data, error } = await supabase
      .from('projetos')
      .update({ status, data_atualizacao: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
}

export async function listarCategorias(req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select('area_atuacao');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.json([]);
    }

    const categorias = Array.from(
      new Set((data ?? []).map((p) => p.area_atuacao).filter(Boolean))
    ).sort() as string[];

    return res.json(categorias);
  } catch (err) {
    console.error('Erro interno ao buscar categorias:', err);
    return res.json([]);
  }
}

export async function excluirProjeto(req: Request, res: Response) {
  try {
    const id = String(req.params.id);

    const { data: projeto, error: buscaError } = await supabase
      .from('projetos')
      .select('id')
      .eq('id', id)
      .single();

    if (buscaError || !projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    const { data: documentos } = await supabase
      .from('documentos')
      .select('caminho_arquivo')
      .eq('projeto_id', id);

    if (documentos && documentos.length > 0) {
      const caminhos = documentos.map((d) => d.caminho_arquivo);
      await supabase.storage.from('egam-documentos').remove(caminhos);
    }

    // O histórico precisa ser removido antes do projeto para não violar a chave estrangeira.
    await supabase.from('historico_status').delete().eq('projeto_id', id);

    await supabase.from('documentos').delete().eq('projeto_id', id);

    const { error: deleteError } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (deleteError) return res.status(400).json({ error: deleteError.message });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Erro ao excluir projeto.' });
  }
}
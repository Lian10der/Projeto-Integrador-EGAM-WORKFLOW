import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// Mesmos valores de STATUS_PROJETO no frontend.
const STATUS_VALIDOS = ['rascunho', 'submetido', 'em_analise', 'aprovado', 'reprovado'];

// Critérios de ordenação permitidos. Só estes valores chegam ao banco.
const ORDENS: Record<string, { coluna: string; ascending: boolean } | undefined> = {
  ranking: { coluna: 'classificacao_ranking', ascending: true },
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
    const leiId = lerTexto(req.query.lei_incentivo_id); // <-- Novo filtro
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
      query = query.eq('lei_incentivo_id', Number(leiId)); // <-- Aplica o filtro
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

export async function criarProjeto(req: Request, res: Response) {
  try {
    const dados = req.body ?? {};

    const titulo = lerTexto(dados.titulo);
    const protocolo = lerTexto(dados.protocolo);
    const cnpj = lerTexto(dados.cnpj);

    if (!titulo || !protocolo || !cnpj) {
      return res.status(400).json({
        error: 'Campos obrigatórios (título, protocolo, cnpj) não preenchidos.',
      });
    }

    const { data, error } = await supabase
      .from('projetos')
      .insert([
        {
          protocolo,
          cnpj,
          titulo,
          status: 'rascunho',
          data_submissao: new Date().toISOString(),
          
          // Campos existentes na tabela do Supabase (imagem)
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
          
          // Aqui está o pulo do gato: o "Resumo Executivo" da tela vai para o campo "objetivo" do banco
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

export async function atualizarStatusHistorico(req: Request, res: Response) {
  try {
    const dados = req.body ?? {};
    const projetoId = req.params.id ?? dados.id;
    const statusNovo = lerTexto(dados.status_novo);
    const usuarioId = dados.usuario_id ?? null;
    const observacao = dados.observacao ?? null;

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

    const statusAnterior = projetoAtual.status;

    const { data: projetoAtualizado, error: errUpdate } = await supabase
      .from('projetos')
      .update({ status: statusNovo, data_atualizacao: new Date() })
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

export async function listarDocumentos(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('projeto_id', id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function adicionarDocumento(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const dados = req.body ?? {};

    const nomeOriginal = lerTexto(dados.nome_original);
    const caminhoArquivo = lerTexto(dados.caminho_arquivo);

    if (!nomeOriginal || !caminhoArquivo) {
      return res.status(400).json({ error: 'Nome original e caminho do arquivo são obrigatórios.' });
    }

    const { data, error } = await supabase
      .from('documentos')
      .insert([
        {
          projeto_id: id,
          categoria: dados.categoria ?? null,
          nome_original: nomeOriginal,
          caminho_arquivo: caminhoArquivo,
          tamanho_bytes: dados.tamanho_bytes ?? null,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      message: 'Documento adicionado com sucesso.',
      data: data[0],
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

    // Valida se o status é um dos permitidos no banco
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
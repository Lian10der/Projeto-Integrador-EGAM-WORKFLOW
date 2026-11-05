import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const listarProjetos = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select('*');

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const buscarProjetoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Projeto não encontrado.' });

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const criarProjeto = async (req: Request, res: Response) => {
  try {
    const {
      protocolo,
      cnpj,
      razao_social,
      nome_responsavel,
      email_contato,
      lei_incentivo_id,
      area_atuacao,
      titulo,
      objetivo,
      impacto_social,
      valor_total,
      valor_solicitado,
      vidas_impactadas,
      estado,
      cidade,
      tipo_entidade,
      telefone,
      site_url,
      sobre_instituicao,
      teto_captacao,
      justificativa_pedido,
      pessoas_alcancadas_estimativa,
      pessoas_alcancadas_comprovadas,
      data_inicio_analise,
      data_fim_analise,
      data_inicio_execucao,
      data_fim_execucao,
      tags
    } = req.body;

    if (!titulo || !protocolo || !cnpj) {
      return res.status(400).json({ error: 'Campos obrigatórios (título, protocolo, cnpj) não preenchidos.' });
    }

    const { data, error } = await supabase
      .from('projetos')
      .insert([
        {
          protocolo,
          cnpj,
          razao_social,
          nome_responsavel,
          email_contato,
          lei_incentivo_id,
          area_atuacao,
          titulo,
          objetivo,
          impacto_social,
          valor_total,
          valor_solicitado,
          status: 'Rascunho',
          vidas_impactadas,
          estado,
          cidade,
          tipo_entidade,
          telefone,
          site_url,
          sobre_instituicao,
          teto_captacao,
          justificativa_pedido,
          pessoas_alcancadas_estimativa,
          pessoas_alcancadas_comprovadas,
          data_inicio_analise,
          data_fim_analise,
          data_inicio_execucao,
          data_fim_execucao,
          tags
        }
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      message: 'Projeto criado com sucesso.',
      data: data[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const atualizarStatusHistorico = async (req: Request, res: Response) => {
  try {
    const projetoId = req.params.id || req.body.id;
    const { status_novo, usuario_id, observacao } = req.body;

    if (!projetoId || !status_novo) {
      return res.status(400).json({ error: 'ID do projeto e status_novo são obrigatórios.' });
    }

    const { data: projetoAtual, error: errBusca } = await supabase
      .from('projetos')
      .select('status')
      .eq('id', projetoId)
      .single();

    if (errBusca) return res.status(404).json({ error: 'Projeto não encontrado.' });

    const status_anterior = projetoAtual.status;

    const { data: projetoAtualizado, error: errUpdate } = await supabase
      .from('projetos')
      .update({ 
        status: status_novo, 
        data_atualizacao: new Date()
      })
      .eq('id', projetoId)
      .select();

    if (errUpdate) return res.status(400).json({ error: errUpdate.message });

    const { error: errHistorico } = await supabase
      .from('historico_status')
      .insert([
        {
          projeto_id: projetoId,
          usuario_id: usuario_id || null,
          status_anterior,
          status_novo,
          observacao: observacao || null,
          data_transicao: new Date()
        }
      ]);

    if (errHistorico) return res.status(400).json({ error: errHistorico.message });

    return res.status(200).json({
      message: 'Status atualizado e histórico registrado com sucesso.',
      data: projetoAtualizado
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const listarDocumentos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('projeto_id', id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

export const adicionarDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoria, nome_original, caminho_arquivo, tamanho_bytes } = req.body;

    if (!nome_original || !caminho_arquivo) {
      return res.status(400).json({ error: 'Nome original e caminho do arquivo são obrigatórios.' });
    }

    const { data, error } = await supabase
      .from('documentos')
      .insert([
        {
          projeto_id: id,
          categoria,
          nome_original,
          caminho_arquivo,
          tamanho_bytes
        }
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      message: 'Documento adicionado com sucesso.',
      data: data[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

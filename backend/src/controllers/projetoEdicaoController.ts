import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const TEXTOS = [
  'titulo', 'area_atuacao', 'objetivo', 'impacto_social', 'estado', 'cidade',
  'razao_social', 'tipo_entidade', 'cnpj', 'nome_responsavel', 'email_contato',
  'telefone', 'site_url', 'sobre_instituicao', 'justificativa_pedido', 'tags',
] as const;

const NUMEROS = ['lei_incentivo_id', 'valor_total', 'teto_captacao', 'valor_solicitado'] as const;
const INTEIROS = ['pessoas_alcancadas_estimativa', 'pessoas_alcancadas_comprovadas'] as const;
const DATAS = ['data_inicio_analise', 'data_fim_analise', 'data_inicio_execucao', 'data_fim_execucao'] as const;

function texto(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const t = valor.trim();
  return t ? t : null;
}

function numero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function inteiro(valor: unknown): number | null {
  const n = numero(valor);
  return n === null ? null : Math.trunc(n);
}

// Aceita só datas no formato AAAA-MM-DD.
function data(valor: unknown): string | null {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor : null;
}

// PATCH /projetos/:id
export async function atualizarProjeto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    const corpo: Record<string, unknown> = req.body ?? {};
    const campos: Record<string, unknown> = {};

    for (const c of TEXTOS) if (c in corpo) campos[c] = texto(corpo[c]);
    for (const c of NUMEROS) if (c in corpo) campos[c] = numero(corpo[c]);
    for (const c of INTEIROS) if (c in corpo) campos[c] = inteiro(corpo[c]);
    for (const c of DATAS) if (c in corpo) campos[c] = data(corpo[c]);

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    if ('titulo' in campos && !campos.titulo) {
      return res.status(400).json({ error: 'O nome do projeto não pode ficar vazio.' });
    }

    if ('cnpj' in campos) {
      const digitos = String(campos.cnpj ?? '').replace(/\D/g, '');
      if (digitos.length !== 14) {
        return res.status(400).json({ error: 'CNPJ inválido. Digite os 14 números.' });
      }
    }

    campos.data_atualizacao = new Date().toISOString();

    const { data: atualizado, error } = await supabase
      .from('projetos')
      .update(campos)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!atualizado) return res.status(404).json({ error: 'Projeto não encontrado.' });

    return res.json({ message: 'Projeto atualizado com sucesso.', data: atualizado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao atualizar o projeto.' });
  }
}
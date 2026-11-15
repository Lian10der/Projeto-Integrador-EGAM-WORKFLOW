import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export async function listarUsuarios(req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, status, data_criacao, auth_id')
      .order('id', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
  }
}

export async function criarUsuario(req: Request, res: Response) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { data: perfilData, error: perfilError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        status: 'ATIVO',
        auth_id: authData.user.id
      }])
      .select()
      .single();

    if (perfilError) {
      // Rollback: Se falhar o perfil, deleta do Auth para não ficar sujo
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Erro ao criar perfil na tabela.', detalhes: perfilError.message });
    }

    return res.status(201).json(perfilData);
  } catch {
    return res.status(500).json({ error: 'Erro inesperado ao criar usuário.' });
  }
}

export async function editarUsuario(req: Request, res: Response) {
  const id = String(req.params.id);
  const { nome, email, status, senha } = req.body;

  try {
    const { data: usuarioExistente, error: buscaError } = await supabase
      .from('usuarios')
      .select('auth_id')
      .eq('id', id)
      .single();

    if (buscaError || !usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const authUpdates: any = {};
    if (email) authUpdates.email = email;
    if (senha) authUpdates.password = senha;

    if (Object.keys(authUpdates).length > 0 && usuarioExistente.auth_id) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        usuarioExistente.auth_id,
        authUpdates
      );
      if (authError) return res.status(400).json({ error: authError.message });
    }

    const { data: perfilAtualizado, error: perfilError } = await supabase
      .from('usuarios')
      .update({ nome, email, status })
      .eq('id', id)
      .select()
      .single();

    if (perfilError) return res.status(400).json({ error: perfilError.message });

    return res.json(perfilAtualizado);
  } catch {
    return res.status(500).json({ error: 'Erro ao editar usuário.' });
  }
}

export async function deletarUsuario(req: Request, res: Response) {
  const id = String(req.params.id);

  try {
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('auth_id')
      .eq('id', id)
      .single();

    if (usuarioExistente?.auth_id) {
      await supabase.auth.admin.deleteUser(usuarioExistente.auth_id);
    }

    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
}
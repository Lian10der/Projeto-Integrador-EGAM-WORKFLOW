import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

async function buscarPerfil(authId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, status')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function login(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const senha = String(req.body?.senha ?? '');

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const authClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data.session || !data.user) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const perfil = await buscarPerfil(data.user.id);

  return res.json({
    message: 'Login realizado com sucesso!',
    token: data.session.access_token,
    usuario: {
      id: perfil?.id ?? null,
      email: data.user.email ?? email,
      nome: perfil?.nome ?? data.user.email ?? email,
    },
  });
}

// Devolve o usuário logado. Precisa do requireAuth antes na rota.
export async function me(_req: Request, res: Response) {
  const authUser = res.locals.authUser as { id: string; email?: string; user_metadata?: any };
  const perfil = await buscarPerfil(authUser.id);

  // Tenta pegar o nome do perfil, depois do user_metadata, e por último o e-mail
  const nome = perfil?.nome || authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário';

  return res.json({
    id: perfil?.id ?? null,
    nome: nome,
    email: perfil?.email ?? authUser.email ?? '',
    status: perfil?.status ?? null,
  });
}
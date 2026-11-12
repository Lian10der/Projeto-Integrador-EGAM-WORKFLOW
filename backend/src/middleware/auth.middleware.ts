import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

// Valida o token e descobre quem está chamando: administrador ou ONG.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  // Contas de ONG têm papel "ong" e CNPJ no app_metadata.
  // Contas sem papel definido são administradores (equipe do IGAM).
  const meta = (data.user.app_metadata ?? {}) as { papel?: string; cnpj?: string; razao_social?: string };
  const ehOng = meta.papel === 'ong';

  res.locals.authUser = data.user;
  res.locals.papel = ehOng ? 'ong' : 'admin';
  res.locals.cnpj = ehOng ? meta.cnpj ?? null : null;
  res.locals.razaoSocial = ehOng ? meta.razao_social ?? null : null;

  return next();
}

// Só administradores passam.
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.papel !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito à equipe do IGAM.' });
  }
  return next();
}

// Só ONGs cadastradas passam.
export function requireOng(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.papel !== 'ong') {
    return res.status(403).json({ error: 'Acesso restrito a ONGs cadastradas.' });
  }
  return next();
}
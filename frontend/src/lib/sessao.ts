export const API_URL = 'http://localhost:3000';

export interface UsuarioAtual {
  id: number | null;
  nome: string;
  email: string;
  status: string | null;
}

// Busca o usuário logado. Retorna null se não houver sessão válida.
export async function buscarUsuarioAtual(): Promise<UsuarioAtual | null> {
  const token = localStorage.getItem('igam_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem('igam_token');
      return null;
    }
    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

export function saudacao(agora: Date = new Date()): string {
  const hora = agora.getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(' ')[0] ?? nome;
}

export function sair(): void {
  localStorage.removeItem('igam_token');
  window.location.href = '/login';
}
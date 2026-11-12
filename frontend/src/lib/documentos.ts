import { API_URL } from '@/lib/sessao';

export interface Documento {
  id: number;
  projeto_id: number;
  categoria: string | null;
  nome_original: string;
  caminho_arquivo: string;
  tamanho_bytes: number | null;
  data_envio: string | null;
}

const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB

function token(): string | null {
  return localStorage.getItem('igam_token');
}

// Retorna a mensagem de erro, ou null se o arquivo for válido.
export function validarPdf(arquivo: File): string | null {
  if (arquivo.type !== 'application/pdf') return 'Envie apenas arquivos PDF.';
  if (arquivo.size > TAMANHO_MAXIMO) return 'O arquivo deve ter no máximo 10 MB.';
  return null;
}

// "base" é o caminho da API: '/projetos' (administrador) ou '/ong/projetos' (ONG).
export async function enviarDocumento(projetoId: number, arquivo: File, base = '/projetos'): Promise<void> {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('categoria', 'Projeto');

  const res = await fetch(`${API_URL}${base}/${projetoId}/documentos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro ao enviar o arquivo.');
}

export async function listarDocumentosDoProjeto(projetoId: number, base = '/projetos'): Promise<Documento[]> {
  const res = await fetch(`${API_URL}${base}/${projetoId}/documentos`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error('Erro ao carregar os documentos.');
  return res.json();
}

// Abre o PDF em nova aba. A aba é criada no clique, para o navegador não bloquear.
export async function abrirDocumento(projetoId: number, documentoId: number, base = '/projetos'): Promise<void> {
  const janela = window.open('', '_blank');

  try {
    const res = await fetch(`${API_URL}${base}/${projetoId}/documentos/${documentoId}/url`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao abrir o documento.');

    if (janela) janela.location.href = data.url;
    else window.open(data.url, '_blank');
  } catch (err) {
    janela?.close();
    throw err;
  }
}
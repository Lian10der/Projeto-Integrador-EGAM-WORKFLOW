import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';

const BUCKET = 'documentos';
const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB

// Guarda o arquivo na memória e aceita apenas PDF.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Envie apenas arquivos PDF.'));
  },
});

// Middleware que devolve erros em JSON, no mesmo padrão do resto da API.
export function uploadPdf(req: Request, res: Response, next: NextFunction) {
  upload.single('arquivo')(req, res, (err: unknown) => {
    if (err) {
      const mensagem =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'O arquivo deve ter no máximo 10 MB.'
          : err instanceof Error
            ? err.message
            : 'Erro ao receber o arquivo.';
      return res.status(400).json({ error: mensagem });
    }
    return next();
  });
}

// Converte o ID da URL em número. Retorna null se não for um ID válido.
function idValido(valor: unknown): number | null {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /projetos/:id/documentos
export async function listarDocumentos(req: Request, res: Response) {
  const projetoId = idValido(req.params.id);
  if (!projetoId) return res.status(404).json({ error: 'Projeto não encontrado.' });

  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('data_envio', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
}

// POST /projetos/:id/documentos (multipart, campo "arquivo")
export async function adicionarDocumento(req: Request, res: Response) {
  try {
    const projetoId = idValido(req.params.id);
    if (!projetoId) return res.status(404).json({ error: 'Projeto não encontrado.' });

    const arquivo = req.file;
    if (!arquivo) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const categoria = typeof req.body?.categoria === 'string' ? req.body.categoria : 'Projeto';

    // Remove acentos e espaços do nome, para o caminho no Storage ser seguro.
    const nomeSeguro = arquivo.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const caminho = `projetos/${projetoId}/${Date.now()}-${nomeSeguro}`;

    const { error: erroUpload } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, arquivo.buffer, { contentType: arquivo.mimetype, upsert: false });

    if (erroUpload) return res.status(400).json({ error: erroUpload.message });

    const { data, error } = await supabase
      .from('documentos')
      .insert([
        {
          projeto_id: projetoId,
          categoria,
          nome_original: arquivo.originalname,
          caminho_arquivo: caminho,
          tamanho_bytes: arquivo.size,
        },
      ])
      .select();

    if (error) {
      // Se o registro falhar, apaga o arquivo já enviado para não deixar lixo no Storage.
      await supabase.storage.from(BUCKET).remove([caminho]);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Documento adicionado com sucesso.',
      data: data[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao enviar o documento.' });
  }
}

// GET /projetos/:id/documentos/:docId/url
// Gera um link temporário (5 minutos) para abrir o PDF. O bucket é privado.
export async function gerarUrlDocumento(req: Request, res: Response) {
  const projetoId = idValido(req.params.id);
  const documentoId = idValido(req.params.docId);
  if (!projetoId || !documentoId) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  const { data: doc, error } = await supabase
    .from('documentos')
    .select('caminho_arquivo')
    .eq('id', documentoId)
    .eq('projeto_id', projetoId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!doc) return res.status(404).json({ error: 'Documento não encontrado.' });

  const { data, error: erroUrl } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.caminho_arquivo, 300);

  if (erroUrl || !data) {
    return res.status(400).json({ error: erroUrl?.message ?? 'Erro ao gerar o link.' });
  }

  return res.json({ url: data.signedUrl });
}
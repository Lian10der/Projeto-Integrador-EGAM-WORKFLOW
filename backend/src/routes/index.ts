import { Router } from 'express';
import {
  listarProjetos,
  buscarProjetoPorId,
  criarProjeto,
  atualizarStatusHistorico,
  listarLeis,
  atualizarStatusKanban,
} from '../controllers/projetoController.js';
import { atualizarProjeto } from '../controllers/projetoEdicaoController.js';
import {
  listarDocumentos,
  adicionarDocumento,
  gerarUrlDocumento,
  uploadPdf,
} from '../controllers/documentoController.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Rota de teste de conexão
router.get('/teste-conexao', (_req, res) => {
  res.json({ mensagem: 'Conexão com a API realizada com sucesso.', status: 'online' });
});

// Leis: liberadas para administradores e ONGs (o formulário usa esta rota)
router.get('/leis-incentivo', listarLeis);

// A partir daqui, tudo é só para administradores
router.use(requireAdmin);

router.get('/', listarProjetos);
router.post('/', criarProjeto);
router.patch('/:id/kanban-status', atualizarStatusKanban);
router.get('/:id', buscarProjetoPorId);

router.patch('/:id/status', atualizarStatusHistorico);
router.patch('/status', atualizarStatusHistorico);

// Edição (vem depois de /status)
router.patch('/:id', atualizarProjeto);

router.get('/:id/documentos', listarDocumentos);
router.post('/:id/documentos', uploadPdf, adicionarDocumento);
router.get('/:id/documentos/:docId/url', gerarUrlDocumento);

export default router;
import { Router } from 'express';
import { requireAuth, requireOng } from '../middleware/auth.middleware.js';
import * as ong from '../controllers/ongController.js';
import { criarProjeto, buscarProjetoPorId } from '../controllers/projetoController.js';
import { atualizarProjeto } from '../controllers/projetoEdicaoController.js';
import {
  listarDocumentos,
  adicionarDocumento,
  gerarUrlDocumento,
  uploadPdf,
} from '../controllers/documentoController.js';

const router = Router();

// Só ONGs autenticadas passam por aqui.
const soOng = [requireAuth, requireOng];

// ----- Públicas (sem login) -----
router.post('/solicitar-codigo', ong.solicitarCodigo);
router.post('/verificar-codigo', ong.verificarCodigo);

// ----- Exigem login de ONG -----
router.get('/me', soOng, ong.me);

router.get('/projetos', soOng, ong.listarProjetosOng);
router.post('/projetos', soOng, ong.forcarCnpjDaOng, criarProjeto);
router.get('/projetos/:id', soOng, ong.projetoDaOng, buscarProjetoPorId);
router.patch('/projetos/:id', soOng, ong.projetoDaOng, ong.removerCamposProtegidos, atualizarProjeto);

router.get('/projetos/:id/documentos', soOng, ong.projetoDaOng, listarDocumentos);
router.post('/projetos/:id/documentos', soOng, ong.projetoDaOng, uploadPdf, adicionarDocumento);
router.get('/projetos/:id/documentos/:docId/url', soOng, ong.projetoDaOng, gerarUrlDocumento);

export default router;
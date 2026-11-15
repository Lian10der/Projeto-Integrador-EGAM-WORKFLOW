import { Router } from 'express';
import { requireAuth, requireOng, requireOngAprovada } from '../middleware/auth.middleware.js';
import * as ong from '../controllers/ongController.js';
import { criarProjeto, buscarProjetoPorId } from '../controllers/projetoController.js';
import { atualizarProjeto } from '../controllers/projetoEdicaoController.js';
import {
  listarDocumentos,
  adicionarDocumento,
  gerarUrlDocumento,
  excluirDocumento,
  uploadPdf,
} from '../controllers/documentoController.js';

const router = Router();

// Só ONGs autenticadas passam por aqui.
const soOng = [requireAuth, requireOng];

// Só ONGs autenticadas E APROVADAS passam por aqui.
const soOngAprovada = [requireAuth, requireOng, requireOngAprovada];

// ----- Exigem login de ONG (mas não necessariamente aprovação) -----
router.get('/me', soOng, ong.me);

// ----- Exigem ONG APROVADA -----
router.get('/projetos', soOngAprovada, ong.listarProjetosOng);
router.post('/projetos', soOngAprovada, ong.forcarCnpjDaOng, criarProjeto);
router.get('/projetos/:id', soOngAprovada, ong.projetoDaOng, buscarProjetoPorId);
router.patch('/projetos/:id', soOngAprovada, ong.projetoDaOng, ong.removerCamposProtegidos, atualizarProjeto);

router.get('/projetos/:id/documentos', soOngAprovada, ong.projetoDaOng, listarDocumentos);
router.post('/projetos/:id/documentos', soOngAprovada, ong.projetoDaOng, uploadPdf, adicionarDocumento);
router.get('/projetos/:id/documentos/:docId/url', soOngAprovada, ong.projetoDaOng, gerarUrlDocumento);
router.delete('/projetos/:id/documentos/:docId', soOngAprovada, ong.projetoDaOng, excluirDocumento);

export default router;
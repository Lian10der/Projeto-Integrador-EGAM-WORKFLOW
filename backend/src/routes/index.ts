import { Router } from 'express';
import { listarProjetos, atualizarStatusHistorico } from '../controllers/projetoController.js';

const router = Router();

router.get('/projetos', listarProjetos);

router.patch('/projetos/status', atualizarStatusHistorico);

export default router;
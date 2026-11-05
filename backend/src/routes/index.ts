import { Router } from 'express';
import { listarProjetos, atualizarStatusHistorico } from '../controllers/projetoController.js';
import { buscarProjetoPorId, criarProjeto } from '../controllers/projetoController.js';

const router = Router();

router.get('/teste-conexao', (_req, res) => {
  res.json({ mensagem: 'Conexão com a API realizada com sucesso.', status: 'online' });
});

router.get('/projetos', listarProjetos);

router.patch('/projetos/status', atualizarStatusHistorico);

router.get('/projetos/:id', buscarProjetoPorId);

router.post('/projetos', criarProjeto);
  
export default router;
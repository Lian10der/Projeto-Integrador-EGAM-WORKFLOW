import { Router } from 'express';
import {
  listarUsuarios,
  criarUsuario,
  editarUsuario,
  deletarUsuario
} from '../controllers/usuarioController.js';

const router = Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.put('/:id', editarUsuario);
router.delete('/:id', deletarUsuario);

export default router;
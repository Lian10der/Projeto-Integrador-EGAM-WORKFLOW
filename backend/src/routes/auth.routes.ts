import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { registrarOng } from '../controllers/ongController.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register-ong', registrarOng);
router.get('/me', requireAuth, me);

export default router;
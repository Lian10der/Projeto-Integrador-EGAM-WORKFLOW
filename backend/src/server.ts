import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import projetoRoutes from './routes/index.js';
import ongRoutes from './routes/ong.routes.js';
import usuarioRoutes from './routes/usuarios.routes.js';
import { requireAuth, requireAdmin } from './middleware/auth.middleware.js';
import {
  listarTodasOngs,
  criarOngComSenha,
  editarOng,
  excluirOng,
  redefinirSenhaOng,
} from './controllers/ongController.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'EGAM Workflow API funcionando' });
});

// Login de administradores (público)
app.use('/auth', authRoutes);

// Área das ONGs (cada rota confere o próprio login)
app.use('/ong', ongRoutes);

// Área dos administradores
app.use('/projetos', requireAuth, projetoRoutes);
app.use('/usuarios', requireAuth, requireAdmin, usuarioRoutes);

// Rotas de administração para ONGs
app.get('/admin/ongs', requireAuth, requireAdmin, listarTodasOngs);
app.post('/admin/ongs', requireAuth, requireAdmin, criarOngComSenha);
app.put('/admin/ongs/:email', requireAuth, requireAdmin, editarOng);
app.delete('/admin/ongs/:email', requireAuth, requireAdmin, excluirOng);
app.put('/admin/ongs/:email/redefinir-senha', requireAuth, requireAdmin, redefinirSenhaOng);

app.listen(env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${env.PORT}`);
});
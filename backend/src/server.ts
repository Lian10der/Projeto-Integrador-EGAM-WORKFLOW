import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ mensagem: 'API E-GAM Workflow - IGAM', status: 'online' });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔎 Teste: http://localhost:${PORT}/api/teste-conexao`);
});

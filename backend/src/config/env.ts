import 'dotenv/config';

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida no arquivo .env`);
  }
  return valor;
}

export const env = {
  SUPABASE_URL: exigir('SUPABASE_URL'),
  SUPABASE_KEY: exigir('SUPABASE_KEY'),
  PORT: Number(process.env.PORT) || 3000,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3001',
};
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/sessao';

export default function EntrarOngPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'E-mail ou senha inválidos.');

      localStorage.setItem('igam_token', data.token);
      router.push('/ong/projetos');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#1a1d21' }}>
      <div style={{ background: '#212529', border: '1px solid #343a40', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e6edf3' }}>Área das ONGs</h1>
          <p style={{ fontSize: '13px', color: '#adb5bd', marginTop: '6px' }}>
            Entre com o e-mail e a senha fornecidos pelo IGAM.
          </p>
        </div>

        {erro && <p className="form-error">{erro}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 600 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@organizacao.org.br"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#adb5bd', fontWeight: 600 }}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
          <button type="submit" className="button button--cyan" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ fontSize: '11px', color: '#6c757d', textAlign: 'center', marginTop: '16px' }}>
          Esqueceu a senha? Entre em contato com o IGAM.
        </p>
      </div>
    </div>
  );
}
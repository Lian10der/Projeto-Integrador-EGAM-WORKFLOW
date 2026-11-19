'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/sessao';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      router.push('/home');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1a1d21' }}>
      
      {/* Lado Esquerdo: Formulário */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          backgroundColor: '#1a1d21',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#e6edf3', lineHeight: 1.1, marginBottom: '12px' }}>
              EGAM Workflow
            </h1>
            <p style={{ fontSize: '14px', color: '#adb5bd' }}>
              Acesse o sistema de gestão de projetos do Instituto Genésio Antônio Mendes
            </p>
          </div>

          {erro && <p className="form-error" style={{ marginBottom: '16px' }}>{erro}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#adb5bd', marginBottom: '8px' }}>
                E-mail do Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#212529',
                  border: '1px solid #343a40',
                  borderRadius: '4px',
                  color: '#e6edf3',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#adb5bd', marginBottom: '8px' }}>
                Senha do Administrador
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#212529',
                    border: '1px solid #343a40',
                    borderRadius: '4px',
                    color: '#e6edf3',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#adb5bd',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                  }}
                >
                  {mostrarSenha ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#00c4cc',
                color: '#0e1116',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '8px',
                letterSpacing: '1px',
              }}
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <p style={{ fontSize: '11px', color: '#6c757d', textAlign: 'center', marginTop: '60px' }}>
            Instituto Genésio Antônio Mendes 2026 © All rights reserved.
          </p>
        </div>
      </div>

      {/* Lado Direito: Painel Visual com a Logo */}
      <div
        style={{
          flex: 1,
          background: 'radial-gradient(circle at 50% 50%, #212529 0%, #1a1d21 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderLeft: '1px solid #343a40',
        }}
      >
        <img 
          src="/logo-igam.png" 
          alt="Instituto Genésio Antônio Mendes" 
          style={{ 
            width: '446px',
            maxWidth: '80%',
            height: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>

    </div>
  );
}
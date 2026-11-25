'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/sessao';

export default function CadastrarOngPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register-ong`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, cnpj, senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível realizar o cadastro.');

      setSucesso(data.message);
      setNome('');
      setEmail('');
      setCnpj('');
      setSenha('');
      setConfirmarSenha('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  }

  const estiloCampo = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#212529',
    border: '1px solid #343a40',
    borderRadius: '4px',
    color: '#e6edf3',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1d21', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#e6edf3', marginBottom: '8px' }}>
          Cadastro de ONG
        </h1>
        <p style={{ fontSize: '14px', color: '#adb5bd', marginBottom: '28px' }}>
          Informe os dados da organização. O acesso será liberado após a aprovação do IGAM.
        </p>

        {erro && <p role="alert" className="form-error" style={{ marginBottom: '16px' }}>{erro}</p>}
        {sucesso && <p role="status" style={{ color: '#00c4cc', marginBottom: '16px' }}>{sucesso}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#adb5bd', fontSize: '12px' }}>
            Razão social
            <input autoComplete="organization" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={150} style={estiloCampo} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#adb5bd', fontSize: '12px' }}>
            E-mail
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={estiloCampo} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#adb5bd', fontSize: '12px' }}>
            CNPJ
            <input
              inputMode="numeric"
              autoComplete="off"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
              required
              maxLength={18}
              style={estiloCampo}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#adb5bd', fontSize: '12px' }}>
            Senha (mínimo de 6 caracteres)
            <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} style={estiloCampo} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#adb5bd', fontSize: '12px' }}>
            Confirmar senha
            <input type="password" autoComplete="new-password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required minLength={6} style={estiloCampo} />
          </label>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '4px', backgroundColor: '#00c4cc', color: '#0e1116', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'CADASTRANDO...' : 'CRIAR CADASTRO'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#adb5bd', marginTop: '24px' }}>
          Já possui cadastro?{' '}
          <Link href="/ong/entrar" style={{ color: '#00c4cc', fontWeight: 700 }}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

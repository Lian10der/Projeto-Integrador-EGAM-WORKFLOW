'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/sessao';

function formatarCnpj(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  let r = d.slice(0, 2);
  if (d.length > 2) r += `.${d.slice(2, 5)}`;
  if (d.length > 5) r += `.${d.slice(5, 8)}`;
  if (d.length > 8) r += `/${d.slice(8, 12)}`;
  if (d.length > 12) r += `-${d.slice(12, 14)}`;
  return r;
}

const cartao: React.CSSProperties = {
  background: '#1c2128',
  border: '1px solid #2d333b',
  borderRadius: '16px',
  padding: '32px',
  width: '100%',
  maxWidth: '420px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const rotulo: React.CSSProperties = { fontSize: '12px', color: '#8b949e', fontWeight: 600 };
const campo: React.CSSProperties = { width: '100%', marginTop: '6px' };

export default function EntrarOngPage() {
  const router = useRouter();

  const [etapa, setEtapa] = useState<'dados' | 'codigo'>('dados');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch(`${API_URL}/ong/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível enviar o código.');

      setAviso(`Código enviado para ${email}. Confira também a caixa de spam.`);
      setEtapa('codigo');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch(`${API_URL}/ong/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código inválido.');

      localStorage.setItem('igam_token', data.token);
      router.push('/ong/projetos');
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0e1116' }}>
      <div style={cartao}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f6fc' }}>Área das ONGs</h1>
          <p style={{ fontSize: '13px', color: '#8b949e', marginTop: '6px' }}>
            Entre com o CNPJ e o e-mail institucional da organização. Você recebe um código de acesso por e-mail.
          </p>
        </div>

        {erro && <p className="form-error">{erro}</p>}
        {aviso && !erro && <p style={{ fontSize: '13px', color: '#11a286' }}>{aviso}</p>}

        {etapa === 'dados' && (
          <form onSubmit={enviarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={rotulo}>CNPJ da organização</label>
              <input
                style={campo}
                value={cnpj}
                onChange={(e) => setCnpj(formatarCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            <div>
              <label style={rotulo}>E-mail institucional</label>
              <input
                style={campo}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@organizacao.org.br"
                required
              />
            </div>
            <button type="submit" className="button button--cyan" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {etapa === 'codigo' && (
          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={rotulo}>Código de 6 números</label>
              <input
                style={campo}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" className="button button--cyan" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => { setEtapa('dados'); setErro(null); setAviso(null); }}
            >
              Usar outro CNPJ ou e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
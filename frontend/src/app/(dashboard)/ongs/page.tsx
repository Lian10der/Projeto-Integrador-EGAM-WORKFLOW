'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';
import { Modal } from '@/components/ui/Modal';
import { API_URL } from '@/lib/sessao';

type Ong = {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  status: string;
  criado_em: string;
};

export default function OngsPage() {
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Ong | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [status, setStatus] = useState('APROVADA');

  const token = typeof window !== 'undefined' ? localStorage.getItem('igam_token') : '';

  const buscarOngs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/ongs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar ONGs.');
      const data = await res.json();
      setOngs(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarOngs();
  }, []);

  const abrirModalNovo = () => {
    setEditando(null);
    setNome('');
    setEmail('');
    setSenha('');
    setCnpj('');
    setStatus('APROVADA');
    setModalAberto(true);
  };

  const abrirModalEditar = (ong: Ong) => {
    setEditando(ong);
    setNome(ong.nome);
    setEmail(ong.email);
    setSenha('');
    setCnpj(ong.cnpj || '');
    setStatus(ong.status);
    setModalAberto(true);
  };

  const salvarOng = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      if (editando) {
        const res = await fetch(`${API_URL}/admin/ongs/${encodeURIComponent(editando.email)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome, cnpj, status }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao editar.');
        }
      } else {
        const res = await fetch(`${API_URL}/admin/ongs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome, email, senha, cnpj }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao criar.');
        }
      }
      setModalAberto(false);
      buscarOngs();
    } catch (err: any) {
      setErro(err.message);
    }
  };

  const redefinirSenha = async (emailOng: string) => {
    const novaSenha = prompt('Digite a nova senha para esta ONG:');
    if (!novaSenha) return;

    try {
      const res = await fetch(`${API_URL}/admin/ongs/${encodeURIComponent(emailOng)}/redefinir-senha`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ novaSenha }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao redefinir senha.');
      }
      alert('Senha redefinida com sucesso. Informe a ONG.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const excluirOng = async (emailOng: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ONG? O acesso será removido.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/ongs/${encodeURIComponent(emailOng)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir.');
      buscarOngs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Gestão de ONGs"
        description="Gerencie o acesso das organizações ao sistema."
        actions={
          <button onClick={abrirModalNovo} className="button button--cyan">
            + Nova ONG
          </button>
        }
      />

      <PageContent>
        {erro && <div className="form-error">{erro}</div>}

        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '16px' }}>Nome</th>
                  <th style={{ padding: '16px' }}>CNPJ</th>
                  <th style={{ padding: '16px' }}>E-mail</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Criado em</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ongs.map((ong) => (
                  <tr key={ong.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{ong.nome}</td>
                    <td style={{ padding: '16px' }}>{ong.cnpj}</td>
                    <td style={{ padding: '16px' }}>{ong.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: ong.status === 'APROVADA' ? 'rgba(17, 162, 134, 0.2)' : 'rgba(238, 82, 104, 0.2)',
                        color: ong.status === 'APROVADA' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {ong.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      {new Date(ong.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button onClick={() => abrirModalEditar(ong)} style={{ marginRight: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                      <button onClick={() => redefinirSenha(ong.email)} style={{ marginRight: '12px', color: 'var(--warning)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Senha</button>
                      <button onClick={() => excluirOng(ong.email)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContent>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar ONG' : 'Nova ONG'} maxWidth="500px">
        <form onSubmit={salvarOng} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nome da Instituição</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          {!editando && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Senha Inicial</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6} />
              </div>
            </>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>CNPJ</label>
            <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} required placeholder="00.000.000/0000-00" />
          </div>
          {editando && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="APROVADA">APROVADA</option>
                <option value="PENDENTE">PENDENTE</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setModalAberto(false)} className="button">Cancelar</button>
            <button type="submit" className="button button--cyan">Salvar</button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
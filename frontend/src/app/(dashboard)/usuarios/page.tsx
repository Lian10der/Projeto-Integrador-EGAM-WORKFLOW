'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';
import { API_URL } from '@/lib/sessao';

type Usuario = {
  id: number;
  nome: string;
  email: string;
  status: string;
  data_criacao: string;
  auth_id: string | null;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('ATIVO');

  const token = typeof window !== 'undefined' ? localStorage.getItem('igam_token') : '';

  const buscarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar usuários.');
      const data = await res.json();
      setUsuarios(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const abrirModalNovo = () => {
    setEditando(null);
    setNome('');
    setEmail('');
    setSenha('');
    setStatus('ATIVO');
    setModalAberto(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha(''); // Senha em branco na edição
    setStatus(usuario.status);
    setModalAberto(true);
  };

  const salvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const payload: any = { nome, email, status };
    if (senha) payload.senha = senha;

    try {
      const url = editando 
        ? `${API_URL}/usuarios/${editando.id}` 
        : `${API_URL}/usuarios`;
      
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao salvar usuário.');

      setModalAberto(false);
      buscarUsuarios();
    } catch (err: any) {
      setErro(err.message);
    }
  };

  const deletarUsuario = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? O acesso dele ao sistema será removido.')) return;
    
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao deletar.');
      buscarUsuarios();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Gestão de Usuários"
        description="Gerencie quem tem acesso ao sistema."
        actions={
          <button onClick={abrirModalNovo} className="button button--cyan">
            + Novo Usuário
          </button>
        }
      />

      <PageContent>
        {erro && <div className="form-error">{erro}</div>}

        {loading ? (
          <p className="empty-state">Carregando usuários...</p>
        ) : (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '16px' }}>ID</th>
                  <th style={{ padding: '16px' }}>Nome</th>
                  <th style={{ padding: '16px' }}>E-mail</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Criado em</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.id}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{user.nome}</td>
                    <td style={{ padding: '16px' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: user.status === 'ATIVO' ? 'rgba(17, 162, 134, 0.2)' : 'rgba(238, 82, 104, 0.2)',
                        color: user.status === 'ATIVO' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button onClick={() => abrirModalEditar(user)} style={{ marginRight: '16px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                      <button onClick={() => deletarUsuario(user.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContent>

      {/* MODAL CRIAR/EDITAR */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: 'bold', color: 'var(--foreground)' }}>
              {editando ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            
            <form onSubmit={salvarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nome Completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Senha {editando && '(Deixe em branco para não alterar)'}
                </label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required={!editando} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalAberto(false)} className="button">Cancelar</button>
                <button type="submit" className="button button--cyan">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { ProjetoCard } from '@/components/projetos/ProjetoCard';
import { ProjetoDetalhe } from '@/components/projetos/ProjetoDetalhe';
import ProjetoForm from '@/components/projetos/ProjetoForm';
import type { Projeto } from '@/types/projeto';
import { API_URL } from '@/lib/sessao';

interface OngInfo {
  email: string;
  cnpj: string | null;
  razao_social: string | null;
}

export default function ProjetosOngPage() {
  const router = useRouter();

  const [ong, setOng] = useState<OngInfo | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [leis, setLeis] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoAberto, setNovoAberto] = useState(false);
  const [detalhe, setDetalhe] = useState<Projeto | null>(null);
  const [editando, setEditando] = useState<Projeto | null>(null);

  const cabecalhos = useCallback(
    () => ({ Authorization: `Bearer ${localStorage.getItem('igam_token') ?? ''}` }),
    []
  );

  const sair = useCallback(() => {
    localStorage.removeItem('igam_token');
    router.push('/ong/entrar');
  }, [router]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const [resOng, resProjetos, resLeis] = await Promise.all([
        fetch(`${API_URL}/ong/me`, { headers: cabecalhos() }),
        fetch(`${API_URL}/ong/projetos`, { headers: cabecalhos() }),
        fetch(`${API_URL}/projetos/leis-incentivo`, { headers: cabecalhos() }),
      ]);

      // Sem login válido de ONG: volta para a tela de entrada
      if ([resOng, resProjetos].some((r) => r.status === 401 || r.status === 403)) {
        sair();
        return;
      }
      if (!resProjetos.ok) throw new Error('Não foi possível carregar os seus projetos.');

      setOng(await resOng.json());
      setProjetos(await resProjetos.json());
      if (resLeis.ok) setLeis(await resLeis.json());
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, [cabecalhos, sair]);

  useEffect(() => {
    if (!localStorage.getItem('igam_token')) {
      router.push('/ong/entrar');
      return;
    }
    carregar();
  }, [carregar, router]);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f6fc' }}>
            {ong?.razao_social ?? 'Minha organização'}
          </h1>
          <p style={{ fontSize: '13px', color: '#8b949e' }}>CNPJ {ong?.cnpj ?? '—'}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="button button--cyan" onClick={() => setNovoAberto(true)}>
            + Novo projeto
          </button>
          <button type="button" className="button button--secondary" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      {loading && <p className="empty-state">Carregando seus projetos...</p>}
      {erro && <p className="form-error">{erro}</p>}

      {!loading && !erro && projetos.length === 0 && (
        <p className="empty-state">Você ainda não tem projetos cadastrados. Clique em "+ Novo projeto" para começar.</p>
      )}

      {!loading && !erro && projetos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projetos.map((projeto) => (
            <ProjetoCard
              key={projeto.id}
              projeto={projeto}
              onVerDetalhes={setDetalhe}
              onEditar={setEditando}
            />
          ))}
        </div>
      )}

      {/* NOVO PROJETO */}
      <Modal isOpen={novoAberto} onClose={() => setNovoAberto(false)} title="Cadastrar Novo Projeto" maxWidth="700px">
        <ProjetoForm
          rota="/ong/projetos"
          cnpjFixo={ong?.cnpj ?? undefined}
          onSuccess={() => {
            setNovoAberto(false);
            carregar();
          }}
        />
      </Modal>

      {/* EDITAR PROJETO */}
      <Modal isOpen={!!editando} onClose={() => setEditando(null)} title="Editar Projeto" maxWidth="700px">
        {editando && (
          <ProjetoForm
            key={editando.id}
            projeto={editando}
            rota="/ong/projetos"
            cnpjFixo={ong?.cnpj ?? undefined}
            onSuccess={() => {
              setEditando(null);
              carregar();
            }}
          />
        )}
      </Modal>

      {/* DETALHES */}
      <Modal isOpen={!!detalhe} onClose={() => setDetalhe(null)} title={detalhe?.titulo || 'Detalhes do Projeto'} maxWidth="800px">
        {detalhe && <ProjetoDetalhe projeto={detalhe} leis={leis} base="/ong/projetos" />}
      </Modal>
    </div>
  );
}
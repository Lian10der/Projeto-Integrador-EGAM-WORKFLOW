'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';
import { ProjetoFiltros, FILTROS_INICIAIS, type FiltrosState } from '@/components/projetos/ProjetoFiltros';
import { ProjetoCard } from '@/components/projetos/ProjetoCard';
import { Modal } from '@/components/ui/Modal';
import ProjetoForm from '@/components/projetos/ProjetoForm';
import { ProjetoDetalhe } from '@/components/projetos/ProjetoDetalhe';
import type { Projeto } from '@/types/projeto';
import { API_URL } from '@/lib/sessao';

function ProjetosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [leis, setLeis] = useState<{ id: number; nome: string; esfera: string; status: string }[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [erroLeis, setErroLeis] = useState<string | null>(null);

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('igam_token');

    fetch(`${API_URL}/projetos/leis-incentivo`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erro ao buscar leis');
        }
        return res.json();
      })
      .then((data) => setLeis(data))
      .catch((err) => setErroLeis(err.message));

    fetch(`${API_URL}/projetos/categorias`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategorias(data);
        else setCategorias([]);
      })
      .catch((err) => {
        console.error('Erro ao buscar categorias:', err);
        setCategorias([]);
      });
  }, []);

  useEffect(() => {
    if (searchParams.get('novo') === 'true') {
      setModalCriarAberto(true);
      router.replace('/projetos');
    }
    const buscaUrl = searchParams.get('busca');
    if (buscaUrl) {
      setFiltros((prev) => ({ ...prev, busca: buscaUrl }));
    }
  }, [searchParams, router]);

  const fetchProjetos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('igam_token');
      const params = new URLSearchParams();
      if (filtros.busca.trim()) params.set('busca', filtros.busca.trim());
      if (filtros.status !== 'todos') params.set('status', filtros.status);
      if (filtros.area.trim()) params.set('area', filtros.area.trim());
      if (filtros.leiId) params.set('lei_incentivo_id', filtros.leiId);
      params.set('ordem', filtros.ordem);

      const response = await fetch(`${API_URL}/projetos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Falha ao carregar os projetos.');
      }

      const data: Projeto[] = await response.json();
      setProjetos(data);

      if (categorias.length === 0 && data.length > 0) {
        const catsUnicas = Array.from(new Set(data.map((p) => p.area_atuacao).filter(Boolean))) as string[];
        setCategorias(catsUnicas);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar projetos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProjetos, 300);
    return () => clearTimeout(timer);
  }, [filtros]);

  const excluirProjeto = async (projeto: Projeto) => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${projeto.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('igam_token');
      const res = await fetch(`${API_URL}/projetos/${projeto.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir projeto.');
      }

      alert('Projeto excluído com sucesso!');
      setProjetoSelecionado(null);
      fetchProjetos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Explorar Projetos"
        description="Consulte os projetos submetidos e filtre por status, área e classificação."
      />

      {erroLeis && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>Erro nas leis: {erroLeis}</p>}

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginTop: '24px' }}>
        <ProjetoFiltros
          filtros={filtros}
          onChange={setFiltros}
          leis={leis}
          categorias={categorias}
        />

        <PageContent>
          {loading && <p className="empty-state">Carregando projetos...</p>}
          {error && <p className="form-error">{error}</p>}

          {!loading && !error && projetos.length === 0 && (
            <p className="empty-state">Nenhum projeto encontrado com esses filtros.</p>
          )}

          {!loading && !error && projetos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', width: '100%' }}>
              {projetos.map((projeto) => (
                <ProjetoCard
                  key={projeto.id}
                  projeto={projeto}
                  onVerDetalhes={setProjetoSelecionado}
                  onEditar={setProjetoEditando}
                />
              ))}
            </div>
          )}
        </PageContent>
      </div>

      <Modal isOpen={modalCriarAberto} onClose={() => setModalCriarAberto(false)} title="Cadastrar Novo Projeto" maxWidth="700px">
        <ProjetoForm
          onSuccess={() => { setModalCriarAberto(false); fetchProjetos(); }}
          categorias={categorias}
        />
      </Modal>

      <Modal isOpen={!!projetoEditando} onClose={() => setProjetoEditando(null)} title="Editar Projeto" maxWidth="700px">
        {projetoEditando && (
          <ProjetoForm
            key={projetoEditando.id}
            projeto={projetoEditando}
            onSuccess={() => { setProjetoEditando(null); fetchProjetos(); }}
            categorias={categorias}
          />
        )}
      </Modal>

      <Modal isOpen={!!projetoSelecionado} onClose={() => setProjetoSelecionado(null)} title={projetoSelecionado?.titulo || 'Detalhes do Projeto'} maxWidth="800px">
        {projetoSelecionado && (
          <ProjetoDetalhe
            projeto={projetoSelecionado}
            leis={leis}
            onExcluir={excluirProjeto}
          />
        )}
      </Modal>
    </PageContainer>
  );
}

export default function ProjetosPage() {
  return (
    <Suspense fallback={<p className="empty-state">Carregando...</p>}>
      <ProjetosContent />
    </Suspense>
  );
}
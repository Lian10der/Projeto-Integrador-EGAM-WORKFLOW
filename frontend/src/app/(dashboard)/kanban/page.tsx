'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';
import { Modal } from '@/components/ui/Modal';
import { ProjetoDetalhe } from '@/components/projetos/ProjetoDetalhe';
import type { Projeto, StatusProjeto } from '@/types/projeto';
import { API_URL } from '@/lib/sessao';

const COLUNAS: { id: StatusProjeto; titulo: string; cor: string }[] = [
  { id: 'rascunho', titulo: 'Rascunho', cor: '#8b949e' },
  { id: 'submetido', titulo: 'Submetido', cor: '#00c4cc' },
  { id: 'em_analise', titulo: 'Em Análise', cor: '#fccb62' },
  { id: 'aprovado', titulo: 'Aprovado', cor: '#11a286' },
  { id: 'reprovado', titulo: 'Reprovado', cor: '#ee5268' },
];

export default function KanbanPage() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estado para o modal de detalhes
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('igam_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/projetos`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { router.push('/login'); return; }
        return res.json();
      })
      .then(data => setProjetos(data))
      .catch(err => setErro('Erro ao carregar projetos.'))
      .finally(() => setLoading(false));
  }, [router]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const novoStatus = destination.droppableId as StatusProjeto;
    const projetoId = Number(draggableId);

    setProjetos(prev =>
      prev.map(p => p.id === projetoId ? { ...p, status: novoStatus } : p)
    );

    try {
      const token = localStorage.getItem('igam_token');
      const res = await fetch(`${API_URL}/projetos/${projetoId}/kanban-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) throw new Error('Falha ao salvar status.');
    } catch (error) {
      alert('Erro ao salvar a mudança. O card voltará para a posição original.');
      window.location.reload();
    }
  };

  const projetosPorColuna = (status: StatusProjeto) => {
    return projetos.filter(p => (p.status as StatusProjeto) === status);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Quadro Kanban"
        description="Arraste os projetos entre as colunas para atualizar o status."
      />

      <PageContent>
        {loading && <p className="empty-state">Carregando quadro...</p>}
        {erro && <p className="form-error">{erro}</p>}

        {!loading && !erro && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div
              className="kanban-board-container"
              style={{
                display: 'flex',
                gap: '16px',
                width: '100%',
                height: 'calc(100vh - 200px)',
                overflowX: 'auto',
                paddingBottom: '16px'
              }}
            >
              {COLUNAS.map(coluna => (
                <div
                  key={coluna.id}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    backgroundColor: '#161b22',
                    borderRadius: '12px',
                    border: '1px solid #2d333b',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #2d333b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: coluna.cor }} />
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#f0f6fc' }}>{coluna.titulo}</h3>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      backgroundColor: '#21262d',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      color: '#8b949e'
                    }}>
                      {projetosPorColuna(coluna.id).length}
                    </span>
                  </div>

                  <Droppable droppableId={coluna.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1,
                          padding: '12px',
                          overflowY: 'auto',
                          backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 196, 204, 0.05)' : 'transparent',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {projetosPorColuna(coluna.id).map((projeto, index) => (
                          <Draggable key={projeto.id} draggableId={String(projeto.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: '#1c2128',
                                  border: '1px solid #2d333b',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  cursor: 'grab',
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
                                  // Só aplica position relative quando o card NÃO está sendo arrastado.
                                  // Durante o arraste, a biblioteca controla a posição.
                                  ...(snapshot.isDragging ? {} : { position: 'relative' as const }),
                                }}
                              >
                                {/* BOTÃO DE DETALHES (Canto superior direito) */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Impede que o clique inicie o arraste
                                    setProjetoSelecionado(projeto);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#8b949e',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#00c4cc'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#8b949e'}
                                  title="Ver Detalhes"
                                >
                                  {/* Ícone de olho (SVG simples) */}
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </button>

                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f0f6fc', marginBottom: '4px', lineHeight: 1.3, paddingRight: '24px' }}>
                                  {projeto.titulo}
                                </h4>
                                <p style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>
                                  {projeto.razao_social ?? 'OSC não informada'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #2d333b' }}>
                                  <span style={{ fontSize: '10px', color: '#6e7681' }}>
                                    {projeto.protocolo}
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#6e7681' }}>
                                    {projeto.cidade ?? 'UF'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </PageContent>

      {/* MODAL DE DETALHES */}
      <Modal
        isOpen={!!projetoSelecionado}
        onClose={() => setProjetoSelecionado(null)}
        title={projetoSelecionado?.titulo || 'Detalhes do Projeto'}
        maxWidth="600px"
      >
        {projetoSelecionado && <ProjetoDetalhe projeto={projetoSelecionado} />}
      </Modal>

    </PageContainer>
  );
}
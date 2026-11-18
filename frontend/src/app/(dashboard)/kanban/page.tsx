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
import styles from './kanban.module.css';

const COLUNAS: { id: StatusProjeto; titulo: string; cor: string }[] = [
  { id: 'rascunho', titulo: 'Rascunho', cor: '#6c757d' },
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
      .catch(() => setErro('Erro ao carregar projetos.'))
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
    } catch {
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
            {/* Container das colunas: flex row para ficarem lado a lado */}
            <div style={{ display: 'flex', gap: '16px', width: '100%', height: 'calc(100vh - 200px)', overflowX: 'auto', paddingBottom: '16px' }}>
              {COLUNAS.map(coluna => (
                <div
                  key={coluna.id}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    backgroundColor: '#1a1d21',
                    borderRadius: '4px',
                    border: '1px solid #343a40',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #343a40', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: coluna.cor }} />
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>{coluna.titulo}</h3>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', backgroundColor: '#212529', padding: '2px 8px', borderRadius: '4px', color: '#adb5bd' }}>
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
                          backgroundColor: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          minHeight: '200px',
                        }}
                      >
                        {projetosPorColuna(coluna.id).map((projeto, index) => (
                          <Draggable key={projeto.id} draggableId={String(projeto.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={styles.card}
                                data-is-dragging={snapshot.isDragging}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjetoSelecionado(projeto);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#adb5bd',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#adb5bd'}
                                  title="Ver Detalhes"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </button>

                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px', lineHeight: 1.3, paddingRight: '24px' }}>
                                  {projeto.titulo}
                                </h4>
                                <p style={{ fontSize: '11px', color: '#adb5bd', marginBottom: '8px' }}>
                                  {projeto.razao_social ?? 'OSC não informada'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #343a40' }}>
                                  <span style={{ fontSize: '10px', color: '#adb5bd' }}>{projeto.protocolo}</span>
                                  <span style={{ fontSize: '10px', color: '#adb5bd' }}>{projeto.cidade ?? 'UF'}</span>
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
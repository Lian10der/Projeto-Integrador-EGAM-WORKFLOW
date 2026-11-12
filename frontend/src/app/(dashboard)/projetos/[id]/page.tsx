'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';

// Utilitários de formatação
function formatarMoeda(valor: number | null): string {
  if (valor === null || valor === undefined) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr: string | null): string {
  if (!dataStr) return '—';
  const data = new Date(dataStr);
  return isNaN(data.getTime()) ? dataStr : data.toLocaleDateString('pt-BR');
}

export default function DetalhesProjetoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [projeto, setProjeto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('igam_token');
        
        const response = await fetch(`http://localhost:3000/projetos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Não foi possível carregar os detalhes do projeto.');
        }

        const data = await response.json();
        setProjeto(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar o projeto.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      carregarDetalhes();
    }
  }, [id, router]);

  return (
    <PageContainer>
      {loading && <p className="empty-state">Carregando ficha técnica completa...</p>}
      
      {error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="form-error">{error}</p>
          <button onClick={() => router.back()} className="button button--secondary" style={{ width: 'fit-content' }}>
            ← Voltar para a lista
          </button>
        </div>
      )}

      {!loading && !error && projeto && (
        <>
          <PageHeader
            title={projeto.titulo}
            description={`Protocolo: ${projeto.protocolo ?? 'N/A'} | Status: ${projeto.status ?? 'N/A'} | Ranking: #${projeto.classificacao_ranking ?? '—'}`}
          />

          <PageContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* BOTÃO DE VOLTAR NO TOPO */}
              <div>
                <button onClick={() => router.back()} className="button button--secondary">
                  ← Voltar para Projetos
                </button>
              </div>

              {/* 1. INFORMAÇÕES GERAIS E IDENTIFICAÇÃO */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>1. Identificação Geral</h3>
                <div style={gridStyle}>
                  <Field label="Título do Projeto" value={projeto.titulo} />
                  <Field label="Protocolo" value={projeto.protocolo} />
                  <Field label="Status Atual" value={projeto.status} />
                  <Field label="Classificação no Ranking" value={projeto.classificacao_ranking} />
                  <Field label="Tags" value={projeto.tags} />
                </div>
              </div>

              {/* 2. DADOS DA INSTITUIÇÃO (OSC) */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>2. Dados da Organização (OSC)</h3>
                <div style={gridStyle}>
                  <Field label="Razão Social" value={projeto.razao_social} />
                  <Field label="CNPJ" value={projeto.cnpj} />
                  <Field label="Tipo de Entidade" value={projeto.tipo_entidade} />
                  <Field label="Área de Atuação" value={projeto.area_atuacao} />
                  <Field label="Estado" value={projeto.estado} />
                  <Field label="Cidade" value={projeto.cidade} />
                  <Field label="Site" value={projeto.site_url} isLink />
                  <Field label="Telefone" value={projeto.telefone} />
                  <Field label="E-mail de Contato" value={projeto.email_contato} />
                  <Field label="Nome do Responsável" value={projeto.nome_responsavel} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Field label="Sobre a Instituição" value={projeto.sobre_instituicao} isFull />
                </div>
              </div>

              {/* 3. OBJETIVOS E IMPACTO SOCIAL */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>3. Objetivos e Impacto Social</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="Objetivo do Projeto" value={projeto.objetivo} isFull />
                  <Field label="Impacto Social Esperado" value={projeto.impacto_social} isFull />
                  <div style={gridStyle}>
                    <Field label="Vidas Impactadas" value={projeto.vidas_impactadas} />
                    <Field label="Pessoas Alcançadas (Estimadas)" value={projeto.pessoas_alcancadas_estimadas ?? projeto.pessoas_alcancadas_est} />
                    <Field label="Pessoas Alcançadas (Efetivas/Comprovadas)" value={projeto.pessoas_alcancadas_efetivas ?? projeto.pessoas_alcancadas_co} />
                  </div>
                </div>
              </div>

              {/* 4. ORÇAMENTOS E VALORES */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>4. Informações Financeiras</h3>
                <div style={gridStyle}>
                  <Field label="Valor Total" value={formatarMoeda(projeto.valor_total)} />
                  <Field label="Valor Solicitado" value={formatarMoeda(projeto.valor_solicitado)} />
                  <Field label="Valor Aprovado" value={formatarMoeda(projeto.valor_aprovado)} />
                  <Field label="Teto de Captação" value={formatarMoeda(projeto.teto_captacao)} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Field label="Justificativa do Pedido" value={projeto.justificativa_pedido} isFull />
                </div>
              </div>

              {/* 5. AVALIAÇÃO E LEI DE INCENTIVO */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>5. Avaliação e Vínculos</h3>
                <div style={gridStyle}>
                  <Field label="ID da Lei de Incentivo" value={projeto.lei_incentivo_id} />
                  <Field label="ID do Avaliador Responsável" value={projeto.avaliador_id} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Field label="Parecer Técnico" value={projeto.parecer_tecnico} isFull />
                </div>
              </div>

              {/* 6. CRONOGRAMA E DATAS */}
              <div style={cardStyle}>
                <h3 style={sectionTitleStyle}>6. Cronograma e Datas</h3>
                <div style={gridStyle}>
                  <Field label="Data de Submissão" value={formatarData(projeto.data_submissao)} />
                  <Field label="Última Atualização" value={formatarData(projeto.data_atualizacao)} />
                  <Field label="Início da Análise" value={formatarData(projeto.data_inicio_analise)} />
                  <Field label="Fim da Análise" value={formatarData(projeto.data_fim_analise)} />
                  <Field label="Início da Execução" value={formatarData(projeto.data_inicio_execucao)} />
                  <Field label="Fim da Execução" value={formatarData(projeto.data_fim_execucao)} />
                </div>
              </div>

              {/* BOTÃO DE VOLTAR NO FIM */}
              <div>
                <button onClick={() => router.back()} className="button button--secondary">
                  ← Voltar para Projetos
                </button>
              </div>

            </div>
          </PageContent>
        </>
      )}
    </PageContainer>
  );
}

// Componente auxiliar para exibir cada campo estruturado
function Field({ label, value, isFull, isLink }: { label: string; value: any; isFull?: boolean; isLink?: boolean }) {
  return (
    <div style={{ gridColumn: isFull ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-subtle, #6e7681)', fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ fontSize: '14px', color: 'var(--foreground, #f0f6fc)', wordBreak: 'break-word' }}>
        {value === null || value === undefined || value === '' ? (
          <span style={{ color: 'var(--text-muted, #8b949e)', fontStyle: 'italic' }}>Não informado</span>
        ) : isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00c4cc)', textDecoration: 'underline' }}>
            {value}
          </a>
        ) : (
          String(value)
        )}
      </div>
    </div>
  );
}

// Estilos base alinhados com o Tema Escuro global
const cardStyle: React.CSSProperties = {
  background: 'var(--card, #1c2128)',
  border: '1px solid var(--border, #2d333b)',
  borderRadius: 'var(--radius-lg, 16px)',
  padding: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '700',
  color: 'var(--primary, #00c4cc)',
  marginBottom: '16px',
  borderBottom: '1px solid var(--border, #2d333b)',
  paddingBottom: '8px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '16px',
};
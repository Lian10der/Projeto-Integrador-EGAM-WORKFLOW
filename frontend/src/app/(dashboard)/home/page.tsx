'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import type { Projeto } from '@/types/projeto';
import {
  API_URL,
  buscarUsuarioAtual,
  saudacao,
  primeiroNome,
  type UsuarioAtual,
} from '@/lib/sessao';

function getStatusColor(statusStr?: string | null): string {
  switch (statusStr) {
    case 'aprovado': return '#11a286';
    case 'em_analise': return '#fccb62';
    case 'submetido': return '#00c4cc';
    case 'rascunho': return '#8b949e';
    case 'reprovado': return '#ee5268';
    default: return '#00c4cc';
  }
}

export default function HomePage() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuario, setUsuario] = useState<UsuarioAtual | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      const token = localStorage.getItem('igam_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const [perfil, respostaProjetos] = await Promise.all([
          buscarUsuarioAtual(),
          fetch(`${API_URL}/projetos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!perfil || respostaProjetos.status === 401) {
          localStorage.removeItem('igam_token');
          router.push('/login');
          return;
        }

        setUsuario(perfil);

        if (respostaProjetos.ok) {
          const data: Projeto[] = await respostaProjetos.json();
          setProjetos(data);
        }
      } catch (err) {
        console.error('Erro ao carregar home:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [router]);

  const projetosOrdenados = [...projetos].sort((a, b) => b.id - a.id);

  const totalInvestido = projetos.reduce(
    (acc, p) => acc + (Number(p.valor_aprovado) || 0),
    0
  );
  const projetosApoiados = projetos.filter((p) => p.status === 'aprovado').length;
  const potencialIncentivo = projetos.reduce((acc, p) => {
    const valorTeto = Number(p.teto_captacao);
    const valorSolicitado = Number(p.valor_solicitado);
    const valorTotal = Number(p.valor_total);
    const valorParaSomar = valorTeto > 0 ? valorTeto : (valorSolicitado > 0 ? valorSolicitado : (valorTotal > 0 ? valorTotal : 0));
    return acc + valorParaSomar;
  }, 0);
  const vidasImpactadas = projetos.reduce(
    (acc, p) => acc + (Number(p.vidas_impactadas) || 0),
    0
  );

  const moeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <PageContainer>
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' }}>
            {usuario ? `${saudacao()}, ${primeiroNome(usuario.nome)}!` : 'Bem-vindo!'}
          </h1>
          <p style={{ fontSize: '14px', color: '#adb5bd' }}>
            Este é o resumo dos projetos e recursos sob gestão do Instituto Genésio Antônio Mendes
          </p>
        </div>

        {loading ? (
          <p className="empty-state">Carregando painel...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <MetricCard title="Total Investido" value={moeda(totalInvestido)} footer="Soma dos valores aprovados" iconContent="↗" iconColor="#11a286" />
              <MetricCard title="Projetos Apoiados" value={projetosApoiados} footer="Projetos com status aprovado" iconContent="↗" iconColor="#f85149" />
              <MetricCard title="Potencial de Incentivo Fiscal" value={moeda(potencialIncentivo)} footer="Soma dos tetos de captação" iconContent="$" iconColor="#fccb62" />
              <MetricCard title="Vidas Impactadas" value={vidasImpactadas.toLocaleString('pt-BR')} footer="Soma de todos os projetos" iconContent="👥" iconColor="#00c4cc" />
            </div>

            <div style={{ background: '#212529', border: '1px solid #343a40', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #343a40', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '13px', color: '#adb5bd' }}>Mostrando projetos recentes</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projetosOrdenados.length === 0 ? (
                  <p style={{ padding: '32px', textAlign: 'center', color: '#adb5bd' }}>
                    Nenhum projeto cadastrado no momento.
                  </p>
                ) : (
                  projetosOrdenados.map((projeto) => {
                    const statusAtual = projeto.status ?? 'rascunho';
                    const corStatus = getStatusColor(statusAtual);

                    return (
                      <div
                        key={projeto.id}
                        onClick={() => router.push(`/projetos`)}
                        style={{
                          padding: '20px 24px',
                          borderBottom: '1px solid #343a40',
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          alignItems: 'center',
                          gap: '16px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#2c3136')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: corStatus, flexShrink: 0 }} />
                          <div>
                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#e6edf3', marginBottom: '2px' }}>
                              {projeto.titulo}
                            </h4>
                            <span style={{ fontSize: '13px', color: '#adb5bd' }}>
                              {projeto.razao_social ?? 'OSC não informada'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', color: corStatus, border: `1px solid ${corStatus}40` }}>
                            {statusAtual.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#adb5bd', textAlign: 'right' }}>
                          {projeto.valor_solicitado
                            ? Number(projeto.valor_solicitado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function MetricCard({
  title,
  value,
  footer,
  iconContent,
  iconColor,
}: {
  title: string;
  value: string | number;
  footer: string;
  iconContent: string;
  iconColor: string;
}) {
  return (
    <div style={{ background: '#212529', border: '1px solid #343a40', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#adb5bd' }}>{title}</span>
        <span style={{ fontSize: '20px', fontWeight: 700, color: iconColor, lineHeight: 1 }}>{iconContent}</span>
      </div>
      <div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#e6edf3', marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        <div style={{ fontSize: '12px', color: '#adb5bd' }}>{footer}</div>
      </div>
    </div>
  );
}
'use client';

import type { Projeto, StatusProjeto } from '@/types/projeto';
import { STATUS_LABEL } from '@/types/projeto';
import styles from './ProjetoCard.module.css';

interface ProjetoCardProps {
  projeto: Projeto;
  onVerDetalhes: (projeto: Projeto) => void;
  onEditar?: (projeto: Projeto) => void;
}

const COR_STATUS: Record<StatusProjeto, string> = {
  rascunho: '#6c757d',
  submetido: '#00c4cc',
  em_analise: '#fccb62',
  aprovado: '#11a286',
  reprovado: '#ee5268',
};

function corDoStatus(status: string | null): string {
  if (status === 'recebido') return COR_STATUS.submetido;
  return COR_STATUS[status as StatusProjeto] ?? COR_STATUS.rascunho;
}

function formatarMoeda(valor: number | null): string {
  if (valor === null) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProjetoCard({ projeto, onVerDetalhes, onEditar }: ProjetoCardProps) {
  const valorCaptado = Number(projeto.valor_solicitado) || 0;
  const meta = Number(projeto.teto_captacao) || Number(projeto.valor_total) || 100000;
  const porcentagem = Math.min((valorCaptado / meta) * 100, 100);

  const statusAtual = projeto.status ?? 'rascunho';
  const statusLabel = STATUS_LABEL[statusAtual as StatusProjeto] ?? statusAtual.replace(/_/g, ' ');
  const cor = corDoStatus(statusAtual);

  const estiloTag: React.CSSProperties = {
    color: cor,
    borderColor: cor,
    backgroundColor: `${cor}1f`,
  };

  return (
    <article className={styles.projectCard}>
      <div
        style={{
          height: '100px',
          backgroundColor: cor,
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#ffffff',
            border: `1px solid ${cor}`,
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>

        {onEditar && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditar(projeto); }}
            title="Editar projeto"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(0,0,0,0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.tagsRow}>
          <span className={styles.subTag} style={estiloTag}>
            {projeto.area_atuacao || 'Categoria'}
          </span>
          <span className={styles.subTag} style={estiloTag}>
            {projeto.protocolo || 'Protocolo'}
          </span>
        </div>

        <h3 className={styles.projectTitle}>{projeto.titulo}</h3>
        <p className={styles.institution}>{projeto.razao_social ?? 'OSC não informada'}</p>

        {projeto.classificacao_ranking !== null && projeto.classificacao_ranking !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#fccb62', marginTop: '4px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < (projeto.classificacao_ranking || 0) ? '★' : '☆'}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#adb5bd', marginTop: '4px' }}>
          <span>📍 {projeto.cidade ?? 'Cidade'}, {projeto.estado ?? 'UF'}</span>
          <span>👥 {projeto.vidas_impactadas ?? projeto.pessoas_alcancadas_estimativa ?? 0} Vidas</span>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#1a1d21', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${porcentagem}%`, height: '100%', backgroundColor: cor, borderRadius: '999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#e6edf3' }}>{formatarMoeda(valorCaptado)}</span>
            <span style={{ fontSize: '12px', color: '#adb5bd' }}>Meta: {formatarMoeda(meta)}</span>
          </div>
        </div>

        <button onClick={() => onVerDetalhes(projeto)} className={styles.btnDetalhes}>
          Ver Detalhes
        </button>
      </div>
    </article>
  );
}
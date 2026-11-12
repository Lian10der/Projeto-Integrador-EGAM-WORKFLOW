'use client';

import { useEffect, useState } from 'react';
import type { Projeto, StatusProjeto } from '@/types/projeto';
import { STATUS_LABEL } from '@/types/projeto';
import { abrirRelatorio } from '@/lib/relatorio';
import { abrirDocumento, listarDocumentosDoProjeto, type Documento } from '@/lib/documentos';

interface LeiResumo {
  id: number;
  nome: string;
}

interface ProjetoDetalheProps {
  projeto: Projeto;
  leis?: LeiResumo[];
  base?: string; // '/projetos' para o administrador, '/ong/projetos' para a ONG
}

function moeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Datas do tipo "date" são lidas como data local, para não voltar um dia.
function data(valor: string | null | undefined): string {
  if (!valor) return '—';
  const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (somenteData) {
    const [, ano, mes, dia] = somenteData;
    return `${dia}/${mes}/${ano}`;
  }
  const d = new Date(valor);
  return isNaN(d.getTime()) ? valor : d.toLocaleDateString('pt-BR');
}

function texto(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  return String(valor);
}

function tamanho(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjetoDetalhe({ projeto, leis = [], base = '/projetos' }: ProjetoDetalheProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [erroDocs, setErroDocs] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    listarDocumentosDoProjeto(projeto.id, base)
      .then((docs) => {
        if (ativo) setDocumentos(docs);
      })
      .catch((err: Error) => {
        if (ativo) setErroDocs(err.message);
      });

    return () => {
      ativo = false;
    };
  }, [projeto.id, base]);

  const statusLabel = STATUS_LABEL[projeto.status as StatusProjeto] ?? projeto.status ?? '—';
  const lei = leis.find((l) => l.id === projeto.lei_incentivo_id);
  const leiTexto = lei
    ? lei.nome
    : projeto.lei_incentivo_id
      ? `ID ${projeto.lei_incentivo_id}`
      : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="button button--cyan" onClick={() => abrirRelatorio(projeto, leis)}>
          Gerar relatório (PDF)
        </button>
      </div>

      <Secao titulo="1. Identificação">
        <Campo label="Status" valor={statusLabel} />
        <Campo label="Protocolo" valor={texto(projeto.protocolo)} />
        <Campo label="Área de atuação" valor={texto(projeto.area_atuacao)} />
        <Campo label="Lei de incentivo" valor={leiTexto} />
        <Campo label="Ranking" valor={texto(projeto.classificacao_ranking)} />
        <Campo label="Tags" valor={texto(projeto.tags)} />
      </Secao>

      <Secao titulo="2. Descrição">
        <CampoLongo label="Resumo executivo" valor={projeto.objetivo} />
        <CampoLongo label="Finalidade e impacto" valor={projeto.impacto_social} />
        <CampoLongo label="Justificativa do pedido" valor={projeto.justificativa_pedido} />
      </Secao>

      <Secao titulo="3. Organização (OSC)">
        <Campo label="Razão social" valor={texto(projeto.razao_social)} />
        <Campo label="CNPJ" valor={texto(projeto.cnpj)} />
        <Campo label="Tipo de entidade" valor={texto(projeto.tipo_entidade)} />
        <Campo label="Cidade / UF" valor={`${texto(projeto.cidade)} / ${texto(projeto.estado)}`} />
        <Campo label="Responsável" valor={texto(projeto.nome_responsavel)} />
        <Campo label="E-mail de contato" valor={texto(projeto.email_contato)} />
        <Campo label="Telefone" valor={texto(projeto.telefone)} />
        <Campo label="Site" valor={texto(projeto.site_url)} />
        <CampoLongo label="Sobre a instituição" valor={projeto.sobre_instituicao} />
      </Secao>

      <Secao titulo="4. Financeiro">
        <Campo label="Valor total" valor={moeda(projeto.valor_total)} />
        <Campo label="Valor solicitado" valor={moeda(projeto.valor_solicitado)} />
        <Campo label="Valor aprovado" valor={moeda(projeto.valor_aprovado)} />
        <Campo label="Teto de captação" valor={moeda(projeto.teto_captacao)} />
      </Secao>

      <Secao titulo="5. Impacto">
        <Campo label="Vidas impactadas" valor={texto(projeto.vidas_impactadas)} />
        <Campo label="Pessoas alcançadas (estimativa)" valor={texto(projeto.pessoas_alcancadas_estimativa)} />
        <Campo label="Pessoas alcançadas (comprovadas)" valor={texto(projeto.pessoas_alcancadas_comprovadas)} />
      </Secao>

      <Secao titulo="6. Avaliação">
        <Campo label="Avaliador (ID)" valor={texto(projeto.avaliador_id)} />
        <CampoLongo label="Parecer técnico" valor={projeto.parecer_tecnico} />
      </Secao>

      <Secao titulo="7. Cronograma">
        <Campo label="Submissão" valor={data(projeto.data_submissao)} />
        <Campo label="Última atualização" valor={data(projeto.data_atualizacao)} />
        <Campo label="Início da análise" valor={data(projeto.data_inicio_analise)} />
        <Campo label="Fim da análise" valor={data(projeto.data_fim_analise)} />
        <Campo label="Início da execução" valor={data(projeto.data_inicio_execucao)} />
        <Campo label="Fim da execução" valor={data(projeto.data_fim_execucao)} />
      </Secao>

      <section>
        <h3 style={tituloSecao}>8. Documentos</h3>

        {erroDocs && <p className="form-error">{erroDocs}</p>}

        {!erroDocs && documentos.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nenhum documento anexado.</p>
        )}

        {documentos.map((doc) => (
          <div
            key={doc.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: '13px',
            }}
          >
            <span style={{ minWidth: 0, wordBreak: 'break-word' }}>
              {doc.nome_original}
              {doc.tamanho_bytes ? (
                <span style={{ color: 'var(--text-muted)' }}> ({tamanho(doc.tamanho_bytes)})</span>
              ) : null}
            </span>
            <button
              type="button"
              className="button button--secondary"
              onClick={() =>
                abrirDocumento(projeto.id, doc.id, base).catch((err: Error) => alert(err.message))
              }
            >
              Abrir
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

// ---------- Blocos auxiliares ----------

const tituloSecao: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--primary)',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '8px',
  marginBottom: '12px',
};

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 style={tituloSecao}>{titulo}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
        {children}
      </div>
    </section>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ minWidth: 0, wordBreak: 'break-word' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      <span>{valor}</span>
    </div>
  );
}

function CampoLongo({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div style={{ gridColumn: '1 / -1', lineHeight: '1.6' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      <span>{texto(valor)}</span>
    </div>
  );
}
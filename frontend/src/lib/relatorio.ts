import type { Projeto, StatusProjeto } from '@/types/projeto';
import { STATUS_LABEL } from '@/types/projeto';

interface LeiResumo {
  id: number;
  nome: string;
}

// Evita que textos do banco quebrem o HTML do relatório.
function escapar(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function moeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Datas do tipo "date" (AAAA-MM-DD) são lidas como data local, sem voltar um dia.
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

function campo(label: string, valor: string, longo = false): string {
  return `<div class="campo${longo ? ' longo' : ''}">
    <span>${escapar(label)}</span>
    <strong>${escapar(valor)}</strong>
  </div>`;
}

function secao(titulo: string, conteudo: string): string {
  return `<section>
    <h2>${escapar(titulo)}</h2>
    <div class="grade">${conteudo}</div>
  </section>`;
}

// Abre uma nova aba com o relatório e chama a impressão.
// Na janela de impressão, escolha "Salvar como PDF".
export function abrirRelatorio(projeto: Projeto, leis: LeiResumo[] = []): void {
  const janela = window.open('', '_blank');
  if (!janela) {
    alert('O navegador bloqueou a janela do relatório. Permita pop-ups para este site.');
    return;
  }

  const lei = leis.find((l) => l.id === projeto.lei_incentivo_id);
  const status = STATUS_LABEL[projeto.status as StatusProjeto] ?? projeto.status ?? '—';
  const geradoEm = new Date().toLocaleString('pt-BR');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatório - ${escapar(projeto.titulo)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 40px; font-size: 13px; line-height: 1.5; }
    header { border-bottom: 3px solid #00a3ab; padding-bottom: 12px; margin-bottom: 24px; }
    header h1 { margin: 0 0 4px; font-size: 22px; }
    header p { margin: 0; color: #555; }
    section { margin-bottom: 22px; break-inside: avoid; }
    section h2 { font-size: 15px; color: #00797f; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 0 0 10px; }
    .grade { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .campo span { display: block; font-size: 11px; color: #666; text-transform: uppercase; }
    .campo strong { font-weight: 600; }
    .longo { grid-column: 1 / -1; }
    footer { margin-top: 32px; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 8px; }
    @media print { body { margin: 18mm; } }
  </style>
</head>
<body>
  <header>
    <h1>${escapar(projeto.titulo)}</h1>
    <p>Protocolo ${escapar(projeto.protocolo)} · Status: ${escapar(status)}</p>
  </header>

  ${secao('1. Identificação', [
    campo('Status', status),
    campo('Protocolo', projeto.protocolo ?? '—'),
    campo('Área de atuação', projeto.area_atuacao ?? '—'),
    campo('Lei de incentivo', lei ? lei.nome : projeto.lei_incentivo_id ? `ID ${projeto.lei_incentivo_id}` : '—'),
    campo('Ranking', projeto.classificacao_ranking !== null ? String(projeto.classificacao_ranking) : '—'),
    campo('Tags', projeto.tags ?? '—'),
  ].join(''))}

  ${secao('2. Descrição', [
    campo('Resumo executivo', projeto.objetivo ?? '—', true),
    campo('Finalidade e impacto', projeto.impacto_social ?? '—', true),
    campo('Justificativa do pedido', projeto.justificativa_pedido ?? '—', true),
  ].join(''))}

  ${secao('3. Organização (OSC)', [
    campo('Razão social', projeto.razao_social ?? '—'),
    campo('CNPJ', projeto.cnpj ?? '—'),
    campo('Tipo de entidade', projeto.tipo_entidade ?? '—'),
    campo('Cidade / UF', `${projeto.cidade ?? '—'} / ${projeto.estado ?? '—'}`),
    campo('Responsável', projeto.nome_responsavel ?? '—'),
    campo('E-mail de contato', projeto.email_contato ?? '—'),
    campo('Telefone', projeto.telefone ?? '—'),
    campo('Site', projeto.site_url ?? '—'),
    campo('Sobre a instituição', projeto.sobre_instituicao ?? '—', true),
  ].join(''))}

  ${secao('4. Financeiro', [
    campo('Valor total', moeda(projeto.valor_total)),
    campo('Valor solicitado', moeda(projeto.valor_solicitado)),
    campo('Valor aprovado', moeda(projeto.valor_aprovado)),
    campo('Teto de captação', moeda(projeto.teto_captacao)),
  ].join(''))}

  ${secao('5. Impacto', [
    campo('Vidas impactadas', projeto.vidas_impactadas !== null ? String(projeto.vidas_impactadas) : '—'),
    campo('Pessoas alcançadas (estimativa)', projeto.pessoas_alcancadas_estimativa !== null ? String(projeto.pessoas_alcancadas_estimativa) : '—'),
    campo('Pessoas alcançadas (comprovadas)', projeto.pessoas_alcancadas_comprovadas !== null ? String(projeto.pessoas_alcancadas_comprovadas) : '—'),
  ].join(''))}

  ${secao('6. Avaliação', [
    campo('Avaliador (ID)', projeto.avaliador_id !== null ? String(projeto.avaliador_id) : '—'),
    campo('Parecer técnico', projeto.parecer_tecnico ?? '—', true),
  ].join(''))}

  ${secao('7. Cronograma', [
    campo('Submissão', data(projeto.data_submissao)),
    campo('Última atualização', data(projeto.data_atualizacao)),
    campo('Início da análise', data(projeto.data_inicio_analise)),
    campo('Fim da análise', data(projeto.data_fim_analise)),
    campo('Início da execução', data(projeto.data_inicio_execucao)),
    campo('Fim da execução', data(projeto.data_fim_execucao)),
  ].join(''))}

  <footer>Instituto Genésio Antônio Mendes · Relatório gerado em ${escapar(geradoEm)}</footer>
</body>
</html>`;

  janela.document.open();
  janela.document.write(html);
  janela.document.close();
  janela.focus();

  // Dá um instante para a página carregar antes de abrir a impressão.
  setTimeout(() => janela.print(), 400);
}
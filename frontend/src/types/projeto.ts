// Tipos compartilhados entre as telas de projetos.
// Centralizar aqui evita duplicacao e ajuda o TypeScript a validar props/eventos.

export const STATUS_PROJETO = [
  'rascunho',
  'submetido',
  'em_analise',
  'aprovado',
  'reprovado',
] as const;

export type StatusProjeto = (typeof STATUS_PROJETO)[number];

export type LeiIncentivo =
  | "rouanet"
  | "pronac"
  | "fumcine"
  | "outra";

// Espelha a tabela "projetos" do Supabase.
// Os nomes dos campos são os mesmos do banco, sem conversão.
export interface Projeto {
  id: number;
  protocolo: string | null;
  cnpj: string | null;
  razao_social: string | null;
  nome_responsavel: string | null;
  email_contato: string | null;
  lei_incentivo_id: number | null;
  area_atuacao: string | null;
  titulo: string;
  objetivo: string | null;
  impacto_social: string | null;
  valor_total: number | null;
  valor_solicitado: number | null;
  valor_aprovado: number | null;
  status: string | null;
  classificacao_ranking: number | null;
  parecer_tecnico: string | null;
  avaliador_id: number | null;
  data_submissao: string | null;
  data_atualizacao: string | null;
  vidas_impactadas: number | null;
  estado: string | null;
  cidade: string | null;
  tipo_entidade: string | null;
  telefone: string | null;
  site_url: string | null;
  sobre_instituicao: string | null;
  teto_captacao: number | null;
  justificativa_pedido: string | null;
  pessoas_alcancadas_estimativa: number | null;
  pessoas_alcancadas_comprovadas: number | null;
  data_inicio_analise: string | null;
  data_fim_analise: string | null;
  data_inicio_execucao: string | null;
  data_fim_execucao: string | null;
  tags: string | null;
}

// Valores do formulario de criacao. Usar um tipo proprio deixa claro
// quais campos existem e quais sao opcionais.
export interface ProjetoFormValues {
  nomeProjeto: string;
  dataInicio: string;
  dataEntrega: string;
  tags: string;
  metaOrcamento: string;
  arquivo: string;
  descricao: string;
}

export const STATUS_LABEL: Record<StatusProjeto, string> = {
  rascunho: 'Rascunho',
  submetido: 'Submetido',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
};

export const LEI_LABEL: Record<LeiIncentivo, string> = {
  rouanet: "Lei Rouanet",
  pronac: "PRONAC",
  fumcine: "FUMCINE",
  outra: "Outra",
};
// Tipos compartilhados entre as telas de projetos.
// Centralizar aqui evita duplicacao e ajuda o TypeScript a validar props/eventos.

export type StatusProjeto =
  | "rascunho"
  | "submetido"
  | "em_analise"
  | "aprovado"
  | "reprovado";

export type LeiIncentivo =
  | "rouanet"
  | "pronac"
  | "fumcine"
  | "outra";

export interface Projeto {
  id: string;
  titulo: string;
  osc: string;
  leiIncentivo: LeiIncentivo;
  areaAtuacao: string;
  status: StatusProjeto;
  valorSolicitado: number;
  dataSubmissao: string;
  descricao?: string;
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
  rascunho: "Rascunho",
  submetido: "Submetido",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export const LEI_LABEL: Record<LeiIncentivo, string> = {
  rouanet: "Lei Rouanet",
  pronac: "PRONAC",
  fumcine: "FUMCINE",
  outra: "Outra",
};
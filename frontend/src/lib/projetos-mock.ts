import type { Projeto } from "@/types/projeto";

// Dados de exemplo para a tela "Explorar Projetos".
// Depois podem ser substituidos por uma chamada ao backend (fetch/axios).
export const PROJETOS_MOCK: Projeto[] = [
  {
    id: "1",
    titulo: "Cultura na Comunidade",
    osc: "Associação Esperança",
    leiIncentivo: "rouanet",
    areaAtuacao: "Cultura",
    status: "em_analise",
    valorSolicitado: 120000,
    dataSubmissao: "2026-09-12",
    descricao: "Projeto de oficinas culturais para jovens da periferia.",
  },
  {
    id: "2",
    titulo: "Esporte e Cidadania",
    osc: "Instituto Movimento",
    leiIncentivo: "pronac",
    areaAtuacao: "Esporte",
    status: "aprovado",
    valorSolicitado: 85000,
    dataSubmissao: "2026-08-30",
  },
  {
    id: "3",
    titulo: "Educação Ambiental",
    osc: "OSC Verde Vida",
    leiIncentivo: "fumcine",
    areaAtuacao: "Meio Ambiente",
    status: "submetido",
    valorSolicitado: 60000,
    dataSubmissao: "2026-10-01",
  },
  {
    id: "4",
    titulo: "Saúde Preventiva",
    osc: "Casa do Bem",
    leiIncentivo: "outra",
    areaAtuacao: "Saúde",
    status: "reprovado",
    valorSolicitado: 45000,
    dataSubmissao: "2026-07-21",
  },
];
"use client";

import { useMemo, useState } from "react";
import { PROJETOS_MOCK } from "@/lib/projetos-mock";
import { ProjetoCard } from "@/components/projetos/ProjetoCard";
import {
  ProjetoFiltros,
  type FiltrosState,
} from "@/components/projetos/ProjetoFiltros";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/ui/PageContent";

const FILTROS_INICIAIS: FiltrosState = {
  busca: "",
  status: "todos",
  lei: "todas",
  area: "",
};

export default function ExplorarProjetosPage() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS);

  const projetosFiltrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return PROJETOS_MOCK.filter((projeto) => {
      const matchBusca =
        termo === "" ||
        projeto.titulo.toLowerCase().includes(termo) ||
        projeto.osc.toLowerCase().includes(termo);
      const matchStatus =
        filtros.status === "todos" || projeto.status === filtros.status;
      const matchLei =
        filtros.lei === "todas" || projeto.leiIncentivo === filtros.lei;
      const matchArea =
        filtros.area.trim() === "" ||
        projeto.areaAtuacao.toLowerCase().includes(filtros.area.trim().toLowerCase());

      return matchBusca && matchStatus && matchLei && matchArea;
    });
  }, [filtros]);

  return (
    <PageContainer>
      <PageHeader
        title="Explorar Projetos"
        description={`${projetosFiltrados.length} projeto(s) disponível(is) para aporte de incentivo fiscal.`}
      />
      <PageContent>
        <ProjetoFiltros filtros={filtros} onChange={setFiltros} />
        {projetosFiltrados.length > 0 ? (
          <div className="projeto-grid">
            {projetosFiltrados.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Nenhum projeto encontrado com os filtros atuais.
          </p>
        )}
      </PageContent>
    </PageContainer>
  );
}
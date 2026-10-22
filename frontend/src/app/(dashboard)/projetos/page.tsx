"use client";

import { useMemo, useState } from "react";
import { PROJETOS_MOCK } from "@/lib/projetos-mock";
import { ProjetoCard } from "@/components/projetos/ProjetoCard";
// import {
//   ProjetoFiltros,
//   type FiltrosState,
// } from "@/components/projetos/ProjetoFiltros";

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
        projeto.areaAtuacao.toLowerCase().includes(filtros.area.toLowerCase());

      return matchBusca && matchStatus && matchLei && matchArea;
    });
  }, [filtros]);

  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>Explorar Projetos</h2>
      </div>

      <div className="page-section__menu">
        <h2>Projetos</h2>
        <p>6 projetos disponíveis para aporte de incentivo fiscal</p>
        {/* <ProjetoFiltros filtros={filtros} onChange={setFiltros} /> */}

        <div className="projeto-grid">
          {projetosFiltrados.map((projeto) => (
            <ProjetoCard key={projeto.id} projeto={projeto} />
          ))}
        </div>

        {projetosFiltrados.length === 0 ? (
          <p className="empty-state">Nenhum projeto encontrado com os filtros atuais.</p>
        ) : null}
      </div>
    </div>
  );
}
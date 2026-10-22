import type { StatusProjeto, LeiIncentivo } from "@/types/projeto";
import { STATUS_LABEL, LEI_LABEL } from "@/types/projeto";

export interface FiltrosState {
  busca: string;
  status: StatusProjeto | "todos";
  lei: LeiIncentivo | "todas";
  area: string;
}

interface ProjetoFiltrosProps {
  filtros: FiltrosState;
  onChange: (filtros: FiltrosState) => void;
}

// Componente controlado: o estado fica na pagina (single source of truth).
export function ProjetoFiltros({ filtros, onChange }: ProjetoFiltrosProps) {
  return (
    <section className="filtros" aria-label="Filtros de projetos">
      <input
        type="search"
        placeholder="Buscar por título ou OSC"
        value={filtros.busca}
        onChange={(event) =>
          onChange({ ...filtros, busca: event.target.value })
        }
      />

      <select
        value={filtros.status}
        onChange={(event) =>
          onChange({
            ...filtros,
            status: event.target.value as FiltrosState["status"],
          })
        }
      >
        <option value="todos">Todos os status</option>
        {(Object.keys(STATUS_LABEL) as StatusProjeto[]).map((status) => (
          <option key={status} value={status}>
            {STATUS_LABEL[status]}
          </option>
        ))}
      </select>

      <select
        value={filtros.lei}
        onChange={(event) =>
          onChange({ ...filtros, lei: event.target.value as FiltrosState["lei"] })
        }
      >
        <option value="todas">Todas as leis</option>
        {(Object.keys(LEI_LABEL) as LeiIncentivo[]).map((lei) => (
          <option key={lei} value={lei}>
            {LEI_LABEL[lei]}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Área de atuação"
        value={filtros.area}
        onChange={(event) => onChange({ ...filtros, area: event.target.value })}
      />
    </section>
  );
}
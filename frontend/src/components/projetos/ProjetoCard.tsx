import type { Projeto } from "@/types/projeto";
import { STATUS_LABEL, LEI_LABEL } from "@/types/projeto";

interface ProjetoCardProps {
  projeto: Projeto;
}

// Componente de apresentacao (sem estado). Recebe um projeto tipado via props.
export function ProjetoCard({ projeto }: ProjetoCardProps) {
  return (
    <article className="projeto-card">
      <header className="projeto-card__header">
        <h3 className="projeto-card__title">{projeto.titulo}</h3>
        <span className={`badge badge--${projeto.status}`}>
          {STATUS_LABEL[projeto.status]}
        </span>
      </header>

      <dl className="projeto-card__info">
        <div>
          <dt>OSC</dt>
          <dd>{projeto.osc}</dd>
        </div>
        <div>
          <dt>Lei</dt>
          <dd>{LEI_LABEL[projeto.leiIncentivo]}</dd>
        </div>
        <div>
          <dt>Área</dt>
          <dd>{projeto.areaAtuacao}</dd>
        </div>
        <div>
          <dt>Valor solicitado</dt>
          <dd>R$ {projeto.valorSolicitado.toLocaleString("pt-BR")}</dd>
        </div>
        <div>
          <dt>Submissão</dt>
          <dd>{new Date(projeto.dataSubmissao).toLocaleDateString("pt-BR")}</dd>
        </div>
      </dl>

      {projeto.descricao ? (
        <p className="projeto-card__descricao">{projeto.descricao}</p>
      ) : null}
    </article>
  );
}
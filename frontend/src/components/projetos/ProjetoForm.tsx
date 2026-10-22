"use client";

import { useState } from "react";
import type { ProjetoFormValues } from "@/types/projeto";

const VALORES_INICIAIS: ProjetoFormValues = {
  nomeProjeto: "",
  dataInicio: "2026-09-15",
  dataEntrega: "2026-09-15",
  tags: "",
  metaOrcamento: "10000.00",
  arquivo: "",
  descricao: "",
};

export function ProjetoForm() {
  const [values, setValues] = useState<ProjetoFormValues>(VALORES_INICIAIS);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjetoFormValues, string>>>({});
  const [enviado, setEnviado] = useState(false);

  function handleChange<K extends keyof ProjetoFormValues>(
    campo: K,
    valor: ProjetoFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar(): boolean {
    const novosErros: Partial<Record<keyof ProjetoFormValues, string>> = {};
    if (values.nomeProjeto.trim() === "") {
      novosErros.nomeProjeto = "Informe o nome do projeto.";
    }
    if (values.metaOrcamento.trim() === "" || Number(values.metaOrcamento) <= 0) {
      novosErros.metaOrcamento = "Informe uma meta válida.";
    }
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validar()) return;
    setEnviado(true);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">Criar Projeto</span>
          <span className="modal__subtitle">
            Novo Projeto <span style={{ color: "#ffffff" }}>›</span>
          </span>
          <button type="button" className="button button--secondary" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modal__divider" />

        {enviado ? (
          <p className="form-success">Projeto criado com sucesso (mock).</p>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 460, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="modal__field">
                <label className="modal__label">Nome do Projeto</label>
                <input
                  className="modal__input"
                  type="text"
                  placeholder="Insira o nome do projeto"
                  value={values.nomeProjeto}
                  onChange={(e) => handleChange("nomeProjeto", e.target.value)}
                />
                {errors.nomeProjeto ? (
                  <span className="form-error">{errors.nomeProjeto}</span>
                ) : null}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "154px 290px", gap: 12 }}>
                <div className="modal__field">
                  <label className="modal__label">Data de Início</label>
                  <input
                    className="modal__input"
                    type="text"
                    value={values.dataInicio}
                    onChange={(e) => handleChange("dataInicio", e.target.value)}
                  />
                </div>
                <div className="modal__field">
                  <label className="modal__label">Adicionar Tags</label>
                  <input
                    className="modal__input"
                    type="text"
                    placeholder="Adicionar Tags"
                    value={values.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "154px 290px", gap: 12 }}>
                <div className="modal__field">
                  <label className="modal__label">Data de Entrega</label>
                  <input
                    className="modal__input"
                    type="text"
                    value={values.dataEntrega}
                    onChange={(e) => handleChange("dataEntrega", e.target.value)}
                  />
                </div>
                <div className="modal__field">
                  <label className="modal__label">Meta de Orçamento</label>
                  <input
                    className="modal__input"
                    type="text"
                    value={values.metaOrcamento}
                    onChange={(e) => handleChange("metaOrcamento", e.target.value)}
                  />
                  {errors.metaOrcamento ? (
                    <span className="form-error">{errors.metaOrcamento}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ width: 244, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="modal__field">
                <label className="modal__label">Anexar Arquivo</label>
                <div
                  style={{
                    height: 48,
                    border: "1px solid #333333",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 8,
                    color: "#505050",
                  }}
                >
                  📎
                  <input
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: "#f5f5f5",
                      fontSize: 16,
                      outline: "none",
                    }}
                    type="text"
                    placeholder="Anexar arquivo"
                    value={values.arquivo}
                    onChange={(e) => handleChange("arquivo", e.target.value)}
                  />
                </div>
              </div>

              <div className="modal__field">
                <label className="modal__label">Descrição</label>
                <textarea
                  className="modal__textarea"
                  placeholder={"Insira uma breve\ndescrição aqui..."}
                  value={values.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="button button--secondary">
              Compartilhar
            </button>
            <button type="button" className="button button--secondary">
              Arquivar
            </button>
            <button type="button" className="button button--secondary">
              Cancelar
            </button>
            <button type="submit" className="button button--cyan">
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
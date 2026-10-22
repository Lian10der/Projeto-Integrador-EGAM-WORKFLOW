import { ProjetoForm } from "@/components/projetos/ProjetoForm";

export default function CriarProjetoPage() {
  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>Criar Projeto</h2>
        <p>Cadastre uma nova proposta de projeto social.</p>
        <ProjetoForm />
      </div>
    </div>
  );
}
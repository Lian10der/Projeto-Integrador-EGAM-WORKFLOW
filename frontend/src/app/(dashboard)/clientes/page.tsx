import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/ui/PageContent";

export default function ClientesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema."
      />
      <PageContent>{/* Conteúdo da página será desenvolvido aqui. */}</PageContent>
    </PageContainer>
  );
}
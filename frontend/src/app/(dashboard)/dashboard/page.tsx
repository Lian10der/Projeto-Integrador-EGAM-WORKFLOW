import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/ui/PageContent";

export default function Page() {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Bem-vindo ao painel administrativo do IGAM Workflow." />
      <PageContent>{/* Conteúdo da página será desenvolvido aqui. */}</PageContent>
    </PageContainer>
  );
}
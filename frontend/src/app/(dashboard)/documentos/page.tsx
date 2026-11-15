import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/ui/PageContent";

export default function Page() {
  return (
    <PageContainer>
      <PageHeader title="Documentos" description="Visualização de documentos (em desenvolvimento)." />
      <PageContent>
        <p className="empty-state">Em breve.</p>
      </PageContent>
    </PageContainer>
  );
}
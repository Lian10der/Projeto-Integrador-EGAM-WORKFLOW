'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContent } from '@/components/ui/PageContent';
import ProjetoForm from '@/components/projetos/ProjetoForm';

export default function NovoProjetoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Cadastrar Novo Projeto"
        description="Preencha as informações abaixo para submeter um novo projeto social para triagem."
      />

      <PageContent>
        <ProjetoForm />
      </PageContent>
    </PageContainer>
  );
}
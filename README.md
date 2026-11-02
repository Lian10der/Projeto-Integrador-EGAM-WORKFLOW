# Sistema de Gestão e Triagem de Projetos (E-GAM Workflow)
 
Sistema web desenvolvido como Projeto Integrador da UNISATC com o objetivo de centralizar, organizar e facilitar o processo de submissão, análise e avaliação de projetos sociais recebidos pelo Instituto Genésio Antônio Mendes (IGAM).
 
> Projeto Integrador — Engenharia de Software, UNISATC (Centro Universitário SATC), 2026.

## Sobre o projeto

O **E-GAM Workflow** permite que uma Organização da Sociedade Civil (OSC) envie uma proposta de projeto social por meio de um formulário público e intuitivo, anexando os documentos obrigatórios e recebendo um protocolo único para acompanhamento da submissão.

A equipe administrativa do IGAM possui acesso a um ambiente restrito onde pode:

- Visualizar projetos submetidos;
- Filtrar propostas por diferentes critérios (Lei de Incentivo, área, status e período);
- Consultar os dados cadastrais das OSCs;
- Visualizar documentos PDF diretamente pela plataforma;
- Atualizar o status das propostas;
- Registrar pareceres, observações e notas técnicas;
- Classificar e ranquear projetos;
- Definir o valor de aporte financeiro aprovado.

O projeto segue rigorosamente o manual de identidade visual e as diretrizes gráficas atualizadas do IGAM, adotando uma arquitetura web modular e enxuta, perfeitamente adequada ao escopo de um MVP acadêmico.

## Funcionalidades

### Para OSCs

- [x] Acesso público ao formulário de submissão (sem exigência de cadastro prévio)
- [x] Formulário estruturado em etapas orientadas
- [x] Cadastro de informações da instituição
- [x] Seleção da Lei de Incentivo e área de atuação
- [x] Cadastro das informações técnicas e escopo do projeto
- [x] Definição dos valores financeiros (total, solicitado e aprovado)
- [x] Upload de documentos essenciais em PDF
- [x] Validação dos campos obrigatórios e verificação de CNPJ válido
- [x] Validação e controle do tamanho dos arquivos
- [x] Revisão dos dados antes do envio final
- [x] Geração de protocolo único de submissão

### Para administradores do IGAM

- [x] Autenticação segura por e-mail e senha
- [x] Painel administrativo (Dashboard) de projetos
- [x] Filtros dinâmicos por Lei de Incentivo, área, status e período
- [x] Visualização detalhada dos projetos e dados das OSCs
- [x] Leitura e consulta de documentos PDF anexados
- [x] Atualização de status do fluxo de triagem
- [x] Registro de pareceres e observações técnicas
- [x] Classificação e ranqueamento das propostas
- [x] Registro do valor de aporte financeiro concedido

## Tecnologias

### Front-end

- **HTML / CSS**
- **React**
- **Next.js**
- **Figma** (Prototipagem de UI/UX)

O React é utilizado para a construção da interface por meio de componentes reutilizáveis, enquanto o Next.js fornece a estrutura da aplicação web e os recursos de rotas e páginas.

### Back-end

- **Node.js**
- **TypeScript**
- **Express**
- Bibliotecas para manipulação e processamento de arquivos PDF

O Node.js gerencia as requisições, a aplicação das regras de negócio, a autenticação e a comunicação com a base de dados, enquanto o Express estrutura a API RESTful e suas rotas.

### Banco de dados

- **PostgreSQL / Supabase**

O PostgreSQL é utilizado para o armazenamento relacional dos dados da aplicação, garantindo integridade referencial, segurança e alto desempenho nas consultas e atualizações.

## Arquitetura

O sistema é estruturado de forma desacoplada em três camadas principais:

```text
┌─────────────────────────────┐
│          Front-end          │
│     React + Next.js         │
└──────────────┬──────────────┘
               │
               │ HTTP / API REST
               ▼
┌─────────────────────────────┐
│          Back-end           │
│ Node.js + TypeScript        │
│          + Express          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│      Banco Relacional       │
└─────────────────────────────┘
```

Os documentos enviados pelas OSCs são processados no backend e associados aos respectivos registros de projetos, permitindo a consulta segura pela equipe administrativa do IGAM.

## Fluxo do sistema

```text
OSC acessa formulário público (sem login)
 └─► Preenche dados da instituição e do projeto
      └─► Anexa documentos obrigatórios em PDF
           └─► Revisa informações e envia
                └─► Recebe protocolo único de submissão
                     └─► Equipe do IGAM acessa painel restrito (Login)
                          └─► Analisa, filtra e gerencia o projeto
                               └─► Registra parecer técnico e define aporte financeiro
```

## Requisitos principais

### Requisitos de negócio

- Centralizar o recebimento de projetos sociais do IGAM.
- Disponibilizar submissão pública direta para as OSCs, sem barreiras de cadastro prévio.
- Exigir enquadramento da proposta em Leis de Incentivo vigentes e áreas de atuação padronizadas.
- Fornecer uma plataforma unificada de triagem para apoiar a comissão avaliadora.

### Requisitos não funcionais

- Interface limpa, responsiva e alinhada à nova identidade visual do IGAM;
- Restrição rigorosa de acesso às telas administrativas por autenticação;
- Limitação de tamanho para upload de anexos;
- Integridade e rastreabilidade dos dados por meio de banco relacional;
- Arquitetura modular e de fácil manutenção para o MVP.

## Equipe

| Integrante               | Responsabilidade           |
| ------------------------ | -------------------------- |
| Anthony Borges           | Back-end / Gestão de Custos|
| Yuri Machado             | Banco de Dados / Back-end  |
| Liander de Almeida Nunes | Scrum Master / Front-end   |
| Kenzo Hara               | UI/UX / Front-end          |

## Instalação e Execução

### Pré-requisitos

Certifique-se de possuir instalado em sua máquina:
- Node.js
- npm ou yarn
- PostgreSQL
- Git

### Clone o repositório

```bash
git clone https://github.com/Lian10der/Projeto-Integrador-EGAM-WORKFLOW.git

cd Projeto-Integrador-EGAM-WORKFLOW
```

### Instale as dependências

```bash
# Na raiz ou nos diretórios específicos de backend/frontend
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` configurando as variáveis necessárias para a execução:

```env
SUPABASE_URL=
SUPABASE_KEY=
PORT=
```

### Inicialização em ambiente de desenvolvimento

```bash
npm run dev
```

## Status do Projeto

**Em desenvolvimento ativo** (Codificação e Infraestrutura do Sistema).

Projeto Integrador — Sistema Web de Gestão  
UNISATC — 2026

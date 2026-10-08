# E-GAM Workflow
 
Sistema web desenvolvido como Projeto Integrador da UNISATC com o objetivo de centralizar, organizar e facilitar o processo de submissão, análise e avaliação de projetos sociais recebidos pelo IGAM.
 
> Projeto Integrador — Engenharia de Software, UNISATC (Centro Universitário SATC), 2026.

## 📌 Sobre o projeto

O **E-GAM Workflow** permite que uma OSC envie uma proposta de projeto social por meio de um formulário público, anexando os documentos necessários e recebendo um protocolo único para acompanhamento da submissão.

A equipe administrativa do IGAM possui acesso a um ambiente restrito onde pode:

* Visualizar projetos submetidos;
* Filtrar propostas por diferentes critérios;
* Consultar os dados das OSCs;
* Visualizar documentos PDF diretamente pela plataforma;
* Atualizar o status das propostas;
* Registrar pareceres e observações;
* Classificar e avaliar projetos;
* Definir o valor de aporte financeiro aprovado.

O projeto foi desenvolvido com foco em uma arquitetura web modular e enxuta, adequada ao escopo de um MVP acadêmico.

## 🚀 Funcionalidades

### Para OSCs

* [x] Acesso público ao formulário de submissão
* [x] Formulário estruturado em etapas
* [x] Cadastro de informações da instituição
* [x] Seleção da Lei de Incentivo e área de atuação
* [x] Cadastro das informações técnicas do projeto
* [x] Definição dos valores financeiros
* [x] Upload de documentos em PDF
* [x] Validação dos campos obrigatórios
* [x] Validação do tamanho dos arquivos
* [x] Revisão dos dados antes do envio
* [x] Geração de protocolo único

### Para administradores do IGAM

* [x] Autenticação por e-mail e senha
* [x] Dashboard de projetos
* [x] Filtros por Lei de Incentivo, área, status e período
* [x] Visualização detalhada dos projetos
* [x] Visualização de documentos PDF
* [x] Atualização do status dos projetos
* [x] Registro de pareceres e observações
* [x] Classificação das propostas
* [x] Registro do valor de aporte aprovado

## 🛠️ Tecnologias

### Front-end

* **HTML**
* **CSS**
* **React**
* **Next.js**

O React será utilizado para construção da interface por meio de componentes reutilizáveis, enquanto o Next.js fornece a estrutura da aplicação web e recursos adicionais para organização das páginas.

### Back-end

* **Node.js**
* **TypeScript**
* **Express**
* Bibliotecas para processamento de arquivos PDF

O Node.js será responsável pelo processamento das requisições, aplicação das regras de negócio, autenticação, gerenciamento das submissões e comunicação com o banco de dados. O Express será utilizado para estruturar a API e suas rotas.

### Banco de dados

* **PostgreSQL**

O PostgreSQL será utilizado para armazenamento dos dados da aplicação, aproveitando seus recursos relacionais, suporte a JSONB e desempenho em operações de consulta e atualização.

## 🏗️ Arquitetura

De forma geral, o sistema é organizado em três partes principais:

```text
┌─────────────────────────────┐
│          Front-end          │
│     React + Next.js         │
└──────────────┬──────────────┘
               │
               │ HTTP / API
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
│      Banco de Dados         │
└─────────────────────────────┘
```

Os documentos enviados pelas OSCs também são processados e associados aos respectivos projetos, permitindo que sejam consultados pela equipe administrativa conforme as permissões do sistema.

## 🔄 Fluxo do sistema

## Fluxo do sistema

OSC
 ↓
Preenche proposta
 ↓
Anexa documentos
 ↓
Revisa e envia
 ↓
Recebe protocolo
 ↓
IGAM analisa
 ↓
Classifica projeto
 ↓
Registra parecer
 ↓
Aprova ou reprova

Esse fluxo corresponde às jornadas de usuário definidas para OSCs e administradores do IGAM no projeto.

## 📋 Requisitos principais

### Requisitos de negócio

* Centralizar o recebimento de projetos sociais.
* Disponibilizar submissão pública sem necessidade de cadastro prévio.
* Exigir o enquadramento da proposta em uma Lei de Incentivo e área de atuação.
* Fornecer uma plataforma unificada para apoiar a avaliação das propostas.

### Requisitos não funcionais

* Interface responsiva e intuitiva;
* Controle de acesso às áreas administrativas;
* Limitação do tamanho dos arquivos enviados;
* Identificação única dos documentos;
* Arquitetura modular e de fácil manutenção;
* Disponibilidade do sistema.

## 👥 Equipe

| Integrante               | Responsabilidade          |
| ------------------------ | ------------------------- |
| Anthony Borges           | Back-end                  |
| Yuri Machado             | Banco de Dados / Back-end |
| Liander de Almeida Nunes | Scrum Master / Front-end  |
| Kenzo Hara               | UI/UX / Front-end         |

## 📁 Estrutura do projeto

> A estrutura abaixo será atualizada conforme o desenvolvimento do sistema.

```text
Projeto-Integrador-EGAM-WORKFLOW/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── ...
│
├── database/
│   └── ...
│
├── docs/
│   └── ...
│
└── README.md
```

## ⚙️ Instalação

### Pré-requisitos

Antes de executar o projeto, certifique-se de possuir instalado:

* Node.js
* npm
* PostgreSQL
* Git

### Clone o repositório

```bash
git clone https://github.com/Lian10der/Projeto-Integrador-EGAM-WORKFLOW.git

cd Projeto-Integrador-EGAM-WORKFLOW
```

### Instale as dependências

```bash
npm install
```

> Os comandos de instalação e execução poderão ser ajustados conforme a estrutura definitiva do projeto.

## ▶️ Execução

Após configurar o banco de dados e as variáveis de ambiente:

```bash
npm run dev
```

A aplicação será executada em ambiente de desenvolvimento.

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=
PORT=
JWT_SECRET=
```

> As variáveis serão definidas conforme a implementação final do back-end.

## 📌 Status

🚧 **Em desenvolvimento**

Projeto Integrador — Sistema Web
UNISATC — 2026

## 📚 Documentação

A documentação do projeto contempla:

* Definição das tecnologias;
* Requisitos de negócio;
* Requisitos funcionais;
* Requisitos não funcionais;
* Jornadas dos usuários;
* Gestão do projeto.

O gerenciamento das tarefas e do backlog é realizado por meio do **GitHub Projects**.

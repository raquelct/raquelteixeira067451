# Pet Manager - Sistema de Registro de Animais de Estimação

## 1. Identificação e Vaga

- **Nome Completo**: Raquel Teixeira
- **Vaga**: Analista de Tecnologia da Informação - Perfil Engenheiro da Computação (Sênior)
- **CPF**: [067.451]
- **Projeto**: Pet Manager - Frontend
- **Número de inscrição**: 16308

---

## 2. Arquitetura e Decisões Técnicas

Este projeto foi projetado seguindo rigorosamente os padrões exigidos no Edital 001/2026/SEPLAG/MT, com foco em escalabilidade, manutenibilidade e separação de responsabilidades.

### 🏛️ Padrão Facade

Implementamos uma camada de **Facade** (`src/facades/`) para atuar como uma interface simplificada entre os componentes da UI e a complexidade das camadas inferiores (Services, Store, API).

- **Isolamento**: A UI não conhece a implementação direta do RxJS ou das chamadas API; ela interage apenas com métodos agnósticos da Facade (ex: `authFacade.login()`).
- **Benefício**: Facilita a substituição de bibliotecas de estado ou mudanças na API sem impactar os componentes visuais.

### 🔄 State Management (RxJS & Hooks)

Adotamos uma abordagem híbrida e otimizada para gerenciamento de estado:

- **Estado Global (Auth)**: Utilizamos `BehaviorSubject` do RxJS (`AuthStore.ts`) para gerenciar o estado de autenticação. Isso permite que múltiplos componentes reajam a mudanças de login/logout em tempo real (Programação Reativa), atendendo ao requisito de controle de sessão global persistente.
- **Estado Local/Ephemeral**: Para formulários e estados de UI passageiros, utilizamos hooks nativos do React (`useState`, `useReducer`) e `React Hook Form`. Isso evita complexidade desnecessária no estado global e melhora a performance de renderização.

### 🛡️ Validação com Zod

A integridade dos dados é garantida através do **Zod** na camada de serviço e formulários.

- **Runtime Validation**: Validamos dados recebidos da API e inputs do usuário em tempo de execução, prevenindo que dados inconsistentes corrompam o estado da aplicação.
- **Type Inference**: Utilizamos a inferência de tipos do Zod para gerar interfaces TypeScript automaticamente, garantindo que os tipos estáticos estejam sempre sincronizados com as regras de validação.

### 🧩 Modularização e Lazy Loading

A aplicação foi estruturada em módulos lógicos (`Pets`, `Tutores`, `Shared`):

- **Code Splitting**: Implementado via `React.lazy` e `Suspense` nas rotas principais. O bundle JS é quebrado em pedaços menores (chunks), garantindo que o usuário baixe apenas o código necessário para a tela que está acessando (Time-to-Interactive reduzido).
- **Shared Module**: Componentes reutilizáveis (Botões, Modais, Inputs) residem em `src/components/ui`, promovendo DRY (Don't Repeat Yourself).

---

## 3. Instruções de Execução

### 🐳 Via Docker (Recomendado)

O ambiente Docker provisiona automaticamente todas as dependências do frontend (Nginx/Node).

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd pet-registry
   ```

2. **Suba os containers:**

   ```bash
   docker-compose up -d --build
   ```

3. **Acesse a aplicação:**
   Abra seu navegador em: [http://localhost:8080](http://localhost:8080)

### 💻 Execução Local

Pré-requisitos: Node.js 18+ e npm/yarn.

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Execute o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

3. **Acesse a aplicação:**
   Abra seu navegador em: [http://localhost:5173](http://localhost:5173)

---

## 4. Testes e Qualidade

A qualidade do código é assegurada por testes automatizados e verificações de saúde.

### 🧪 Testes Unitários

Utilizamos **Vitest** + **React Testing Library** para testar componentes e regras de negócio.

- **Executar todos os testes:**
  ```bash
  npm test
  ```
- **Modo Watch (Desenvolvimento):**
  ```bash
  npm test -- --watch
  ```

### 💓 Health Checks

Implementamos endpoints/utilitários para monitoramento em ambientes orquestrados (K8s/Docker):

- **Liveness Probe**: Verifica se a aplicação React carregou corretamente no DOM.
- **Readiness Probe**: Verifica a conectividade com a API Backend (`https://pet-manager-api.geia.vip`).
- **Verificação**: Utilitário disponível em `src/utils/healthCheck.ts`.

---

## 5. Justificativas e Priorização

Para garantir a entrega de valor alinhada ao nível Senior exigido:

1.  **Prioridade: Robustez e Tipagem (TypeScript Strict)**
    - Em sistemas governamentais/corporativos, a manutenibilidade a longo prazo é crítica. Adotamos **Strict Mode** e eliminamos o uso de `any` para prevenir erros silenciosos e facilitar o onboarding de novos desenvolvedores.

2.  **Prioridade: UX/UI Responsiva (Mobile First)**
    - O sistema deve ser acessível em campo por agentes. Utilizamos **Tailwind CSS** para criar interfaces fluidas que funcionam perfeitamente em tablets e smartphones, não apenas desktops.

3.  **Decisão: Camada de Abstração (Facade)**
    - Ao invés de acoplar componentes diretamente ao Axios ou RxJS, a Facade Blinda a aplicação. trazendo uma visão arquitetural de longo prazo, permitindo refatorações futuras na camada de dados sem "quebrar" o frontend.

4.  **Decisão: Zod para Schemas**
    - Segurança e integridade de dados. Validar na entrada (API) e na saída (Formulários) mitiga vulnerabilidades e garante que o backend receba dados higienizados.

# 🐾 Cadastro Público de Pets

## Informações do Desenvolvedor

**Nome:** [Seu Nome Completo]  
**CPF:** [123.456.789-00]  
**Identificação:** NomeCompleto_123456

---

## 📋 Sobre o Projeto

Sistema de Cadastro Público de Pets desenvolvido como parte do processo seletivo para **SEPLAG/MT - Perfil Sênior**.

Este projeto é uma SPA (Single Page Application) construída com as tecnologias e padrões arquiteturais especificados no edital oficial.

---

## 🚀 Stack Tecnológico

### Core
- **React 18** - Framework Frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server

### Estilização
- **Tailwind CSS** - Framework CSS utilitário para design responsivo

### Gerenciamento de Estado
- **RxJS BehaviorSubject** - Gerenciamento de estado reativo (requisito obrigatório do edital)

### Comunicação HTTP
- **Axios** - Cliente HTTP com interceptors para JWT e Refresh Token
- **API Base URL:** `https://pet-manager-api.geia.vip`

### Arquitetura
- **Facade Pattern** - Padrão arquitetural implementado na estrutura de pastas

---

## 📁 Estrutura do Projeto

```
src/
├── api/              # Configuração do Axios e clientes HTTP
├── facades/          # Camada Facade para simplificar interfaces complexas
├── services/         # Lógica de negócio e serviços
├── components/       # Componentes React reutilizáveis
├── hooks/            # Custom React Hooks
├── pages/            # Páginas/Views da aplicação
├── types/            # Definições de tipos TypeScript
├── state/            # Gerenciamento de estado (BehaviorSubject stores)
└── utils/            # Utilitários e helpers
```

---

## 🏗️ Recursos Implementados

### ✅ Requisitos Técnicos do Edital

1. **Facade Pattern**
   - Estrutura de pastas organizada para suportar o padrão
   - Separação clara entre camadas (api, facades, services, components)

2. **BehaviorSubject (RxJS)**
   - `AuthStore.ts` - Store de autenticação usando BehaviorSubject
   - Gerenciamento reativo de estado com Observables
   - Persistência de tokens no localStorage

3. **Health Checks**
   - **Liveness Probe** - Verifica se a aplicação está viva
   - **Readiness Probe** - Verifica se a aplicação está pronta (conectividade com API)
   - Endpoint/utilitário dedicado para health checks

4. **API Client (Axios)**
   - Instância configurada com `baseURL: https://pet-manager-api.geia.vip`
   - **Request Interceptor** - Adiciona JWT Bearer Token automaticamente
   - **Response Interceptor** - Implementa lógica de Refresh Token
   - Tratamento de erros 401 com renovação automática de tokens

5. **TypeScript**
   - Totalmente tipado com interfaces
   - Tipos definidos para Auth, Health Checks, etc.

6. **Tailwind CSS**
   - Configurado para design responsivo
   - Tema customizado com cores primárias
   - Componentes estilizados com classes utilitárias

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Entre no diretório
cd pet-registry

# Instale as dependências
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Login**: Usuário envia credenciais → Recebe `accessToken` e `refreshToken`
2. **Armazenamento**: Tokens são armazenados no localStorage e no `AuthStore`
3. **Requisições**: Todas as requisições incluem `Authorization: Bearer <accessToken>`
4. **Renovação**: Quando o `accessToken` expira (401), o interceptor automaticamente:
   - Pausa requisições pendentes
   - Usa o `refreshToken` para obter novos tokens
   - Atualiza o `AuthStore`
   - Retenta todas as requisições pendentes

### AuthStore (BehaviorSubject)

```typescript
// Assinar mudanças no estado de autenticação
authStore.getAuthState().subscribe((state) => {
  console.log('Auth state changed:', state);
});

// Obter snapshot do estado atual
const currentState = authStore.getCurrentAuthState();

// Fazer login
authStore.setAuth(user, tokens);

// Fazer logout
authStore.clearAuth();
```

---

## 🏥 Health Checks

A aplicação implementa dois tipos de health checks conforme requisitos do edital:

### Liveness Probe
Verifica se a aplicação está viva e respondendo.

### Readiness Probe
Verifica se a aplicação está pronta para receber tráfego (conectividade com API externa).

**Uso:**

```typescript
import { performHealthCheck } from './utils/healthCheck';

const healthStatus = await performHealthCheck();
console.log(healthStatus);
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.9",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "typescript": "~5.6.2",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.5"
  }
}
```

---

## 📝 Convenções de Código

- **ESLint** configurado para React e TypeScript
- **Strict mode** habilitado no TypeScript
- Nomenclatura de arquivos: PascalCase para componentes, camelCase para utilitários
- Imports organizados: externos → internos → relativos
- Comentários em português para documentação do edital

---

## 🎯 Próximos Passos

- [ ] Implementar CRUD completo de pets
- [ ] Adicionar validação de formulários
- [ ] Implementar roteamento (React Router)
- [ ] Adicionar testes unitários (Jest/Vitest)
- [ ] Implementar camada Facade para APIs complexas
- [ ] Adicionar tratamento de erros global
- [ ] Implementar loading states e feedback visual

---

## 📄 Licença

Este projeto foi desenvolvido para fins de avaliação no processo seletivo SEPLAG/MT.

---

## 👤 Contato

**Desenvolvedor:** [Seu Nome]  
**Email:** [seu.email@example.com]  
**Telefone:** [(XX) XXXXX-XXXX]

---

**Desenvolvido com ❤️ para SEPLAG/MT**

# Projecto Personagens LLM - Frontend

Interface web para interagir com personagens do universo Tolkien, permitindo conversas contextualizadas baseadas em períodos históricos e fatores específicos.

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- API Integration com FastAPI backend

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Funcionalidades

- Seleção de personagem (Ungoliant, Sauron, Azog, Saruman, Gollum)
- Escolha de período histórico específico para cada personagem
- Seleção de fatores históricos relevantes
- Escolha do idioma para comunicação
- Interface de chat em tempo real
- Respostas contextualizadas baseadas nas escolhas do usuário

## Requisitos

- Node.js 18+
- Backend rodando em `http://localhost:8001`

## Estrutura do Projeto

- `/src/components` - Componentes React reutilizáveis
- `/src/services` - Serviços de API e integrações
- `/src/types` - Definições de tipos TypeScript
- `/src/app` - Páginas e layouts da aplicação

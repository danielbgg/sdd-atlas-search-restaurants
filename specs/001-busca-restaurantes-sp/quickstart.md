# Quickstart: Busca de Restaurantes em São Paulo (MVP)

## Objetivo

Validar rapidamente o fluxo principal do MVP: mapa de São Paulo + busca de restaurantes por geolocalização, nome com autocomplete fuzzy e filtros por culinária e preço.

## Pré-requisitos

- Node.js 20+
- MongoDB Atlas com coleção `restaurants` populada e índice Atlas Search `default` criado
- Variáveis de ambiente configuradas em `backend/.env` com `MONGODB_URI`

## Instalação e setup

```bash
# 1. Instalar dependências
cd backend && npm install
cd ../frontend && npm install
cd ../seed && npm install

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Editar backend/.env e preencher MONGODB_URI

# 3. Popular banco de dados (1.000 restaurantes + índice Atlas Search)
cd seed && npm run seed
```

## Executar a aplicação

```bash
# Terminal 1 — Backend (porta 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && npm run dev
```

Abrir no navegador: http://localhost:5173

## Executar testes

```bash
# Backend (65 testes: unit, integration, contract)
cd backend && npm test

# Frontend (22 testes: integration)
cd frontend && npm test
```

## Passos de validação manual

1. Abra a interface no navegador.
2. O mapa deve centrar em São Paulo automaticamente.
3. Mova ou dê zoom no mapa → lista de restaurantes deve atualizar.
4. Digite um nome no campo de busca → sugestões devem aparecer.
5. Teste com até 2 erros (ex: "pizaria" em vez de "pizzaria") → sugestões relevantes.
6. Selecione uma sugestão → resultados combinam texto + área do mapa.
7. Use os filtros de culinária e preço → resultados se restringem.

## Verificar API diretamente

```bash
# Health check
curl http://localhost:3001/v1/health

# Busca por viewport
curl "http://localhost:3001/v1/restaurants/search?neLat=-23.5&neLng=-46.6&swLat=-23.7&swLng=-46.8"

# Busca com texto e filtros
curl "http://localhost:3001/v1/restaurants/search?neLat=-23.5&neLng=-46.6&swLat=-23.7&swLng=-46.8&q=pizza&cuisine=italiana&priceRange=2"

# Autocomplete
curl "http://localhost:3001/v1/restaurants/autocomplete?q=pizz"
```

## Cenários de verificação rápida

- **Cenário A**: Busca apenas por mapa retorna restaurantes da área visível.
- **Cenário B**: Autocomplete retorna sugestões relevantes para prefixo válido.
- **Cenário C**: Autocomplete retorna sugestões com até 2 caracteres incorretos.
- **Cenário D**: Combinação de mapa + nome restringe resultados corretamente.
- **Cenário E**: Estado vazio é exibido quando não há resultado para filtros ativos.
- **Cenário F**: Filtro por culinária retorna apenas restaurantes com aquele tipo.
- **Cenário G**: Filtro por preço retorna apenas restaurantes dentro da faixa.

## Metas de aceite operacional

- Atualização de resultados em p95 ≤ 2s para interação de pan/zoom.
- Sugestões de autocomplete em p95 ≤ 400ms percebidos pelo usuário.
- Nenhum erro bloqueador no fluxo principal durante demonstração.


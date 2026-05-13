# 🍽️ Atlas Search Restaurants — SP

MVP de busca de restaurantes em **São Paulo** combinando busca geoespacial por viewport de mapa, autocomplete fuzzy por nome e filtros dinâmicos com facets — tudo sobre **MongoDB Atlas Search**.

![Stack](https://img.shields.io/badge/MongoDB-Atlas_Search-00ED64?logo=mongodb&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=nodedotjs&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?logo=react&logoColor=white)
![Data](https://img.shields.io/badge/Dados-OpenStreetMap_(ODbL)-7EBC6F?logo=openstreetmap&logoColor=white)

---

## O que o projeto faz

O usuário abre um mapa interativo centralizado em São Paulo e, conforme navega (pan/zoom), a lista de restaurantes próximos é atualizada em tempo real. É possível buscar pelo nome do restaurante com tolerância a erros de digitação, filtrar por tipo de culinária, faixa de preço e avaliação mínima — todos os filtros alimentados dinamicamente pelos dados do próprio Atlas Search.

### Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| US1 | Busca por viewport | Resultados atualizam ao mover/zoom no mapa Leaflet |
| US2 | Autocomplete fuzzy | Sugestões ao digitar, tolerando até 2 erros de digitação |
| US3 | Filtros combinados | Cuisine + faixa de preço ($–$$$$) + avaliação mínima |
| US4 | Lista de resultados | Cards com 5 estados: loading / empty / error / success / filtered-empty |
| US5 | Zoom por autocomplete | Selecionar sugestão centraliza e faz fly-to no restaurante |
| US6 | Zoom por lista | Clicar em card da lista faz fly-to no restaurante |
| US7 | Query logging | Todas as queries MongoDB são logadas no console do backend |
| US8 | Favicon | Ícone SVG temático (garfo + faca, cores MongoDB) |
| US9 | Crosshair | Marcador CSS fixo no centro do mapa |
| US10 | Facets dinâmicos | Filtros populados via `$searchMeta` — contagens reais do banco |

---

## Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **TypeScript** | 5.x | Linguagem (compilado via ts-node-dev) |
| **Express** | 4.x | Framework HTTP, rotas RESTful versionadas (`/v1`) |
| **MongoDB Node.js Driver** | 6.x | Conexão com Atlas, queries e aggregations |
| **Zod** | 3.x | Validação de parâmetros de entrada nas rotas |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18 | UI reativa com hooks e Context API |
| **TypeScript** | 5.x | Tipagem estática |
| **Vite** | 5 | Build e dev server com HMR |
| **react-leaflet** | 4.2 | Mapa interativo com Leaflet 1.9.4 |
| **@tanstack/react-query** | 5 | Cache e sincronização de dados do servidor |

### Dados
| Tecnologia | Uso |
|---|---|
| **OpenStreetMap** via Overpass API | Fonte dos 2.481 restaurantes reais de SP |
| **MongoDB Atlas** | Banco de dados hospedado na nuvem |
| **MongoDB Atlas Search** | Motor de busca textual e geoespacial |

---

## MongoDB Atlas Search — recursos utilizados

Este projeto usa o Atlas Search como motor central de busca. O índice `default` é criado automaticamente pelo script `seed/createIndex.js` com o seguinte mapeamento:

### Operadores usados

#### `$search` — busca textual + geoespacial combinados
```js
// Compound query: geo + texto + filtros
{
  $search: {
    index: 'default',
    compound: {
      must: [
        { geoWithin: { path: 'location', box: { bottomLeft, topRight } } },  // viewport
        { text: { query: q, path: 'name', fuzzy: { maxEdits: 2 } } }         // texto fuzzy
      ],
      filter: [
        { text:   { query: cuisine,    path: 'cuisine'    } },  // filtro de culinária
        { equals: { value: priceRange, path: 'priceRange' } },  // filtro de preço
        { range:  { path: 'rating',    gte: minRating     } }   // avaliação mínima
      ]
    }
  }
}
```

#### `$search` com operator `autocomplete` — sugestões ao digitar
```js
{
  $search: {
    index: 'default',
    autocomplete: {
      query: term,
      path: 'name',
      fuzzy: { maxEdits: 2, prefixLength: 1 },
      tokenOrder: 'sequential'
    }
  }
}
```

#### `$searchMeta` com `facet` — contagens dinâmicas para filtros
```js
{
  $searchMeta: {
    index: 'default',
    facet: {
      operator: { geoWithin: { path: 'location', box: viewport } },
      facets: {
        cuisineFacet:    { type: 'string', path: 'cuisine',    numBuckets: 50 },
        priceRangeFacet: { type: 'number', path: 'priceRange', boundaries: [1,2,3,4,5] },
        ratingFacet:     { type: 'number', path: 'rating',     boundaries: [1,2,3,4,5,6] }
      }
    }
  }
}
```

### Tipos de campo no índice Atlas Search

| Campo | Tipos no índice | Finalidade |
|---|---|---|
| `name` | `autocomplete` + `string` | Sugestões ao digitar e busca fuzzy |
| `cuisine` | `string` + `stringFacet` | Filtro de culinária e contagem no facet |
| `priceRange` | `number` + `numberFacet` | Filtro de preço e contagem no facet |
| `rating` | `number` + `numberFacet` | Filtro de avaliação e contagem no facet |
| `location` | `geo` | Busca geoespacial por viewport |
| `neighborhood`, `categories`, `city` | `string` | Busca textual auxiliar |

---

## Como o projeto foi criado — Spec-Driven Development (SDD)

O projeto foi desenvolvido com a metodologia **Spec-Driven Development**, implementada via [SpecKit](https://speckit.dev). Nessa abordagem, antes de escrever qualquer linha de código, são gerados artefatos de design estruturados que guiam toda a implementação:

```
specs/001-busca-restaurantes-sp/
├── spec.md          # User Stories, requisitos funcionais e critérios de aceite
├── plan.md          # Decisões de arquitetura, stack, metas de performance
├── data-model.md    # Esquema MongoDB, tipos de campo e estratégia de seed
├── quickstart.md    # Guia de setup e validação rápida do MVP
├── contracts/       # Contratos HTTP das APIs (request/response por rota)
└── tasks.md         # Tarefas ordenadas por dependência com status de conclusão
```

O fluxo foi: `spec → plan → tasks → implement`, garantindo que cada decisão técnica fosse rastreável a um requisito de negócio antes de ser codificada.

---

## Estrutura do projeto

```
├── backend/
│   └── src/
│       ├── api/           # Rotas Express (/v1/restaurants, /v1/autocomplete, /v1/restaurants/facets)
│       ├── repositories/  # Queries MongoDB e pipelines Atlas Search
│       ├── services/      # Lógica de negócio
│       ├── models/        # Interfaces TypeScript dos documentos
│       └── validation/    # Schemas Zod para validação de entrada
├── frontend/
│   └── src/
│       ├── components/    # MapView, SearchFilters, RestaurantResultsList, etc.
│       ├── hooks/         # useFacets (debounced), useSearchSession
│       ├── pages/         # HomePage (wiring de estado + API)
│       ├── services/      # apiClient (fetch para o backend)
│       └── state/         # searchSessionStore (useReducer + Context)
├── seed/
│   ├── fetchData.js       # Busca restaurantes reais via Overpass API (OSM)
│   ├── ingest.js          # Importa restaurants.json para o MongoDB Atlas
│   ├── createIndex.js     # Cria/recria o índice Atlas Search
│   └── checkIndexStatus.js # Utilitário: verifica se o índice está ativo
└── specs/                 # Artefatos SDD da feature
```

---

## Pré-requisitos

- **Node.js 20+**
- **MongoDB Atlas** — cluster M0 (free tier) é suficiente para o MVP
  - O cluster deve estar na versão **7.0+** para suporte a `createSearchIndex` via driver

---

## Setup e execução

### 1. Clone o repositório

```bash
git clone https://github.com/danielbgg/sdd-atlas-search-restaurants.git
cd sdd-atlas-search-restaurants
```

### 2. Configure as variáveis de ambiente

O projeto usa dois arquivos `.env` independentes: um para o backend e um para o seed.

```bash
# Backend
cp backend/.env.example backend/.env

# Seed (script de importação de dados)
cp seed/.env.example seed/.env
```

Edite **ambos** os arquivos e preencha com a connection string do seu cluster Atlas:

```env
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

> **Onde obter:** MongoDB Atlas → seu cluster → "Connect" → "Drivers" → copie a connection string.  
> Substitua `<usuario>`, `<senha>`, `<cluster>` e `<database>` pelos valores reais.

### 3. Instale as dependências

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd seed && npm install && cd ..
```

### 4. Importe os dados e crie o índice Atlas Search

> ⚠️ **Este passo é obrigatório** antes de iniciar a aplicação. Sem ele, não haverá dados no banco nem índice de busca.

```bash
cd seed
npm run seed
```

Esse comando executa em sequência:
1. **`fetch`** — busca ~2.481 restaurantes reais de SP via OpenStreetMap (Overpass API)
2. **`ingest`** — importa os dados no MongoDB Atlas, limpando registros anteriores
3. **`create-index`** — cria o índice Atlas Search `default` com todos os tipos necessários

O índice leva **1–2 minutos** para ficar ativo no Atlas após a criação. Você pode verificar o status com:

```bash
node --env-file=.env checkIndexStatus.js
# status: READY | queryable: true
```

### 5. Inicie a aplicação

```bash
# Terminal 1 — Backend (porta 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && npm run dev
```

Acesse: **http://localhost:5173**

---

## API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/v1/restaurants?neLat=&neLng=&swLat=&swLng=&q=&cuisine=&priceRange=&minRating=` | Busca restaurantes no viewport |
| `GET` | `/v1/autocomplete?q=&limit=` | Sugestões de nomes (autocomplete fuzzy) |
| `GET` | `/v1/restaurants/facets?neLat=&neLng=&swLat=&swLng=` | Contagens dinâmicas para filtros |

---

## Dados

Os dados são obtidos do **OpenStreetMap** via [Overpass API](https://overpass-api.de) e são atualizados a cada execução de `npm run seed`.

- **Fonte:** OpenStreetMap © Colaboradores do OpenStreetMap
- **Licença:** [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/)
- **Volume atual:** ~2.481 restaurantes únicos, 234 bairros distintos
- **Bounding box:** município de São Paulo (`-23.95,-46.80,-23.42,-46.37`)

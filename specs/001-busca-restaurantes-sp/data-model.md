# Data Model: Busca de Restaurantes em Sao Paulo (MVP)

## Entity: Restaurant

- Description: Restaurante elegivel para exibicao em mapa e lista de resultados.
- Fields:
  - id (string, required, unique)
  - name (string, required)
  - location (GeoPoint, required)
    - Formato GeoJSON: { type: "Point", coordinates: [longitude, latitude] }
  - address (string, optional)
  - neighborhood (string, optional) — bairro do restaurante em SP
  - city (string, required; must be "Sao Paulo" no MVP)
  - categories (array<string>, optional)
  - cuisine (string, optional) — tipo de culinária (ex: "japonesa", "italiana", "brasileira")
  - priceRange (integer, optional) — faixa de preço de 1 (barato) a 4 (caro)
  - rating (number, optional) — avaliação média de 1.0 a 5.0
  - reviewCount (integer, optional) — número total de avaliações
  - hours (object, optional) — { open: "HH:MM", close: "HH:MM" }
  - scoreTextual (number, computed) — score de relevância textual do Atlas Search
  - distanceMeters (number, computed) — distância calculada a partir do centro do viewport
- Validation rules:
  - name nao pode ser vazio.
  - location deve conter latitude/longitude validas no formato GeoJSON Point.
  - coordinates deve seguir a ordem [longitude, latitude].
  - city deve permanecer dentro do escopo do MVP.
  - priceRange deve ser inteiro entre 1 e 4, se informado.
  - rating deve ser número entre 1.0 e 5.0, se informado.

## Value Object: MapViewport

- Description: Recorte geografico visivel no mapa usado para filtrar restaurantes.
- Fields:
  - centerLat (number, required)
  - centerLng (number, required)
  - zoomLevel (number, required)
  - northEastLat (number, required)
  - northEastLng (number, required)
  - southWestLat (number, required)
  - southWestLng (number, required)
- Validation rules:
  - zoomLevel dentro de faixa suportada pela interface.
  - bbox deve ser consistente (NE acima de SW).

## Entity: SearchQuery

- Description: Estado da busca textual por nome no contexto da sessao de usuario.
- Fields:
  - rawText (string, optional)
  - normalizedText (string, optional)
  - fuzzyMaxEdits (integer, required, fixed em 2 no MVP)
  - selectedSuggestionId (string, optional)
- Validation rules:
  - fuzzyMaxEdits = 2 para este MVP.
  - rawText pode ser vazio para busca apenas geografica.

## Aggregate: SearchSession

- Description: Combina viewport + query textual para produzir conjunto de resultados.
- Fields:
  - sessionId (string, required)
  - viewport (MapViewport, required)
  - query (SearchQuery, optional)
  - results (array<Restaurant>, computed)
  - resultCount (integer, computed)
  - status (enum: loading, success, empty, error)
- State transitions:
  - loading -> success quando resultados existem.
  - loading -> empty quando nao ha resultados para filtros ativos.
  - loading -> error quando ocorre falha de consulta.
  - success/empty -> loading ao alterar mapa ou texto de busca.

## Relationships

- SearchSession 1:1 MapViewport
- SearchSession 0:1 SearchQuery
- SearchSession 1:N Restaurant (resultados)

## Query Inputs and Outputs

- Input principal: viewport + query textual opcional.
- Output principal: lista ordenada de restaurantes com dados minimos para mapa e lista.

## Atlas Search Index

- Coleção: `restaurants`
- Campos indexados para busca textual: `name`, `cuisine`, `neighborhood`, `categories`
- Campos indexados para filtros: `priceRange`, `rating`, `city`
- Campo geoespacial: `location` (tipo `geo` no índice do Atlas Search)
- Nome do índice: `default`

## Seed Data

O banco deve ser populado com **1.000 restaurantes reais de São Paulo** antes
da primeira execução em demo.

- Fonte: **OpenStreetMap** via Overpass API (script `seed/fetchData.js`) — dados públicos, sem necessidade de credenciais
- Licença: OpenStreetMap © Colaboradores do OpenStreetMap (ODbL 1.0)
- Coleção alvo: `restaurants`
- Pré-requisito para criação dos índices do Atlas Search
- Comando: `npm run seed` (equivale a `fetch` + `ingest` + `create-index`)
- O script `ingest.js` apaga documentos anteriores antes de inserir (import limpo)
- Distribuição esperada: cobrir 25+ bairros diferentes de SP com nomes e
  coordenadas geoespaciais verificadas pelo mapeamento colaborativo do OSM

### Campos obrigatórios no seed
Todos os 1.000 documentos devem ter preenchidos:
- `name`, `location`, `city`, `neighborhood`, `cuisine`

### Campos recomendados no seed
Preencher em 100% dos documentos para maximizar a demo:
- `priceRange`, `rating`, `reviewCount`, `address`, `categories`

### Critério de aceite
Coleção `restaurants` com ≥ 1.000 documentos válidos, com campos
obrigatórios preenchidos em 100% dos documentos e campos recomendados
preenchidos em no mínimo 90% dos documentos.
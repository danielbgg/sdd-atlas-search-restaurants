# Data Model: Busca de Restaurantes em Sao Paulo (MVP)

## Entity: Restaurant

- Description: Restaurante elegivel para exibicao em mapa e lista de resultados.
- Fields:
  - id (string, required, unique)
  - name (string, required)
  - location (GeoPoint, required)
  - address (string, optional)
  - city (string, required; must be "Sao Paulo" no MVP)
  - categories (array<string>, optional)
  - scoreTextual (number, computed)
  - distanceMeters (number, computed)
- Validation rules:
  - name nao pode ser vazio.
  - location deve conter latitude/longitude validas.
  - city deve permanecer dentro do escopo do MVP.

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

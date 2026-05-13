# Research: Busca de Restaurantes em Sao Paulo (MVP)

## Decision 1: Arquitetura web com frontend + backend

- Decision: Separar o MVP em frontend web para interacao com mapa e backend HTTP para consultas de busca.
- Rationale: Mantem fluxo de UX responsivo, simplifica controle de filtros e centraliza regras de consulta.
- Alternatives considered:
  - Monolito server-side com renderizacao completa: descartado por reduzir fluidez das interacoes de mapa.
  - Frontend consumindo Atlas diretamente: descartado por acoplamento de credenciais e regras de consulta no cliente.

## Decision 2: Busca geografica por viewport do mapa

- Decision: Usar area visivel do mapa (bounding box) e ponto de partida para recuperar restaurantes proximos no recorte ativo.
- Rationale: O comportamento do produto e orientado por mapa; viewport representa melhor a intencao do usuario durante pan/zoom.
- Alternatives considered:
  - Busca radial fixa por distancia unica: descartado por nao refletir mudancas de zoom.
  - Busca apenas por cidade sem recorte: descartado por volume excessivo e baixa relevancia local.

## Decision 3: Busca por nome com autocomplete e fuzzy ate 2 caracteres

- Decision: Aplicar autocomplete com tolerancia de erro de ate 2 caracteres para sugestoes de restaurantes.
- Rationale: Atende diretamente o objetivo do MVP de tolerancia a digitacao incorreta mantendo descoberta rapida.
- Alternatives considered:
  - Match exato: descartado por baixa usabilidade para nomes longos e erros comuns.
  - Fuzzy acima de 2 caracteres: descartado por aumentar ruido de relevancia no contexto do MVP.

## Decision 4: Escopo inicial restrito a Sao Paulo

- Decision: Limitar dados e consultas ao municipio de Sao Paulo no MVP.
- Rationale: Reduz complexidade de dados, facilita validacao de resultados e garante foco na demonstracao principal.
- Alternatives considered:
  - Cobertura nacional desde o inicio: descartado por ampliar risco e tempo de entrega.

## Decision 5: Estrategia de qualidade e testes

- Decision: Cobrir cada historia com testes unitarios, integracao e contrato para endpoints de busca/autocomplete.
- Rationale: Alinha com a constituicao do projeto e minimiza regressao em dois fluxos sensiveis (mapa e texto).
- Alternatives considered:
  - Testes apenas de interface manual: descartado por fragilidade e baixa repetibilidade.

## Decision 6: Orcamento de desempenho para MVP

- Decision: Definir metas de p95 para atualizacao de mapa e autocomplete, com monitoracao por logs de latencia.
- Rationale: O valor do MVP depende de resposta rapida durante navegacao e digitacao.
- Alternatives considered:
  - Sem metas mensuraveis no MVP: descartado por contrariar requisitos constitucionais.

## Resolved Clarifications

- Linguagem e stack: TypeScript/Node.js para backend e frontend web para interacoes de mapa.
- Contratos externos: API HTTP publica interna do produto para busca geoespacial e autocomplete.
- Padrao de filtro geografico: viewport do mapa como criterio primario de recorte.
- Regra fuzzy: limite de 2 caracteres incorretos aplicado ao autocomplete de nome.

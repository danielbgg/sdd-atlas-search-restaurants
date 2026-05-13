# Feature Specification: Busca de Restaurantes em Sao Paulo (MVP)

**Feature Branch**: `001-busca-restaurantes-sp`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "Quero fazer uma aplicacao para demonstrar funcionalidades do MongoDB e do Atlas... MVP com busca por geolocalizacao e nome do restaurante com autocomplete e fuzzy matching de ate 2 caracteres."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar restaurantes proximos no mapa (Priority: P1)

Como pessoa em Sao Paulo, quero selecionar meu ponto de partida no mapa e ajustar o zoom para visualizar restaurantes proximos da regiao escolhida.

**Why this priority**: Este e o fluxo principal de valor do MVP. Sem ele, nao existe busca contextual por localizacao.

**Independent Test**: Pode ser testado isoladamente ao abrir o mapa, selecionar um ponto em Sao Paulo, ajustar zoom e validar que os resultados exibidos ficam dentro da area visivel.

**Acceptance Scenarios**:

1. **Given** que o usuario abriu o mapa e escolheu um ponto de partida em Sao Paulo, **When** ele define um nivel de zoom, **Then** o sistema exibe restaurantes da area correspondente ao viewport.
2. **Given** que o usuario altera zoom ou desloca o mapa, **When** a interacao e concluida, **Then** a lista e os marcadores sao atualizados para refletir a nova area.

---

### User Story 2 - Buscar restaurante por nome com tolerancia a erro (Priority: P2)

Como pessoa que ja tem um nome em mente, quero digitar o nome do restaurante e receber sugestoes com autocomplete, mesmo com ate 2 caracteres digitados incorretamente.

**Why this priority**: Complementa o fluxo de descoberta por mapa e valida o diferencial de busca textual tolerante a erro.

**Independent Test**: Pode ser testado isoladamente digitando nomes completos, prefixos e termos com ate 2 erros para verificar se as sugestoes relevantes aparecem.

**Acceptance Scenarios**:

1. **Given** que o usuario comeca a digitar no campo de busca, **When** o texto tem correspondencia por prefixo, **Then** o sistema apresenta sugestoes de nomes de restaurantes.
2. **Given** que o usuario digita um nome com ate 2 caracteres incorretos, **When** existem opcoes relevantes, **Then** o sistema ainda retorna sugestoes adequadas.

---

### User Story 3 - Combinar localizacao e nome para refinar resultado (Priority: P3)

Como pessoa buscando opcoes praticas, quero combinar o local escolhido no mapa com o nome digitado para ver restaurantes relevantes proximos de mim.

**Why this priority**: Garante coerencia entre os dois modos de busca do MVP e melhora precisao da descoberta.

**Independent Test**: Pode ser testado isoladamente aplicando um termo de busca e depois movendo o mapa, validando que os resultados respeitam simultaneamente texto e area visivel.

**Acceptance Scenarios**:

1. **Given** que o usuario definiu uma area no mapa e digitou um nome, **When** a busca e executada, **Then** os resultados atendem ao filtro textual e geografico ao mesmo tempo.

---

### User Story 4 - Filtrar restaurantes por tipo de culinaria e preco (Priority: P2)

Como pessoa descobrindo opcoes, quero filtrar os restaurantes visiveis no mapa por tipo de culinaria e faixa de preco para encontrar opcoes relevantes ao meu contexto.

**Why this priority**: Demonstra as capacidades de facets e filtros compostos do Atlas Search, que sao diferenciais centrais da demonstracao.

**Independent Test**: Pode ser testado isoladamente selecionando um filtro de cuisine ou priceRange e validando que apenas restaurantes correspondentes aparecem nos resultados.

**Acceptance Scenarios**:

1. **Given** que o usuario selecionou um tipo de culinaria, **When** a busca e executada, **Then** apenas restaurantes com aquele cuisine aparecem nos resultados.
2. **Given** que o usuario selecionou uma faixa de preco, **When** a busca e executada, **Then** apenas restaurantes dentro daquela faixa aparecem nos resultados.
3. **Given** que o usuario combinou filtro de cuisine, priceRange e area do mapa, **When** a busca e executada, **Then** os resultados respeitam todos os filtros simultaneamente.

---

### User Story 5 - Navegar ao restaurante selecionado no autocomplete (Priority: P2)

Como pessoa que encontrou o restaurante desejado via autocomplete, quero que o mapa navegue automaticamente até ele com zoom máximo ao selecionar a sugestão.

**Why this priority**: Elimina a fricção de localizar manualmente no mapa um restaurante já identificado pelo nome.

**Independent Test**: Digitar um nome, selecionar uma sugestão e validar que o mapa centraliza e aplica zoom máximo nas coordenadas daquele restaurante.

**Acceptance Scenarios**:

1. **Given** que o usuario digitou um nome e as sugestoes aparecem, **When** ele seleciona uma sugestao, **Then** o mapa navega com animação (flyTo) até as coordenadas do restaurante em zoom máximo (18).
2. **Given** que o usuario selecionou uma sugestao, **When** a navegação é concluída, **Then** o dropdown de sugestoes fica oculto e o campo exibe o nome escolhido.

---

### User Story 6 - Navegar ao restaurante selecionado na lista de resultados (Priority: P2)

Como pessoa explorando a lista de resultados, quero clicar em um restaurante da lista para que o mapa navegue até ele com zoom máximo.

**Why this priority**: Complementa a descoberta visual — o usuário pode ler os detalhes na lista e confirmar a localização exata no mapa.

**Independent Test**: Com resultados carregados, clicar em um card da lista e validar que o mapa centraliza com flyTo no restaurante selecionado.

**Acceptance Scenarios**:

1. **Given** que a lista de resultados exibe restaurantes, **When** o usuario clica em um card, **Then** o mapa navega com animação até as coordenadas daquele restaurante em zoom 18.
2. **Given** que o usuario clica no mesmo restaurante novamente, **Then** o mapa não refaz a animação (idempotente por ID).

---

### User Story 10 - Filtros dinâmicos via Atlas Search Facets (Priority: P2)

Como pessoa explorando restaurantes, quero que as opções de culinária e faixa de preço mostrem apenas os valores disponíveis na área visível do mapa, com contagem de restaurantes por opção.

**Why this priority**: Demonstra o operador `$searchMeta facet` do Atlas Search — diferencial central da demo que não existe em queries tradicionais MongoDB.

**Independent Test**: Navegar o mapa para uma área com poucos restaurantes e verificar que o dropdown de culinária lista apenas as culinárias presentes nessa área (não a lista hardcoded completa), com contagens corretas.

**Acceptance Scenarios**:

1. **Given** que o usuario está vendo o mapa, **When** o viewport é carregado, **Then** o dropdown de culinária lista apenas os valores presentes nos restaurantes daquela área, ordenados por contagem decrescente.
2. **Given** que o usuario move o mapa para outra área, **When** o viewport muda, **Then** os filtros são atualizados (após debounce de 400ms) para refletir a nova área.
3. **Given** que o usuario está em área com restaurantes, **When** os facets são carregados, **Then** cada opção mostra o nome e a contagem de restaurantes entre parênteses.
4. **Given** que o usuario tem um filtro ativo que não existe na nova área, **Then** o filtro permanece visualmente selecionado mas os resultados refletem a ausência de correspondências.

---

### User Story 8 - Favicon personalizado (Priority: P3)

Como usuário acessando o site, quero ver um ícone temático na aba do navegador que identifique o site como uma aplicação de busca de restaurantes.

**Acceptance Scenarios**:

1. **Given** que o usuario abre o site, **Then** a aba do navegador exibe um ícone com garfo e faca nas cores da identidade visual (#001E2B + #00ED64).

---

### User Story 9 - Marcador de centro do mapa (Priority: P2)

Como usuário interagindo com o mapa, quero ver um crosshair vermelho fixo no centro da tela para saber exatamente qual ponto geográfico está sendo usado como referência da minha busca.

**Why this priority**: Elimina ambiguidade sobre qual área está sendo buscada — o centro do viewport é implicitamente o "ponto do usuário".

**Acceptance Scenarios**:

1. **Given** que o usuario visualiza o mapa, **Then** um crosshair vermelho aparece fixo no centro independente de pan ou zoom.
2. **Given** que o usuario arrasta o mapa, **Then** o crosshair permanece no centro da tela (é um elemento DOM fixo, não um marcador Leaflet).
3. **Given** que o mapa exibe marcadores de restaurantes, **Then** o crosshair não bloqueia cliques nesses marcadores (pointer-events: none).

---

### User Story 7 - Visualizar queries MongoDB no backend (Priority: P3)

Como desenvolvedor demonstrando as capacidades do Atlas Search, quero ver no console do servidor as queries e pipelines de agregação exatos enviados ao MongoDB para cada busca.

**Why this priority**: Diferencial didático da demonstração — mostra ao vivo como geo, texto e filtros se traduzem em operadores MongoDB ($geoWithin, $search compound, autocomplete).

**Independent Test**: Executar uma busca com geo + texto + filtros e verificar no console do servidor o pipeline JSON correspondente com todos os campos preenchidos.

**Acceptance Scenarios**:

1. **Given** que o usuario faz uma busca apenas por viewport, **When** a query é executada, **Then** o servidor loga o filtro `$geoWithin` com as coordenadas do bounding box.
2. **Given** que o usuario adiciona texto e/ou filtros à busca, **When** a query é executada, **Then** o servidor loga o pipeline `$search compound` completo com os `must` (geo + text) e `filter` (cuisine, priceRange) populados.
3. **Given** que o usuario usa o autocomplete, **When** a query é executada, **Then** o servidor loga o pipeline com `$search autocomplete` incluindo o termo e configuração fuzzy.

---

### Edge Cases

- O que acontece quando o usuario seleciona uma area sem restaurantes no viewport?
- Como o sistema responde quando a busca por nome nao encontra correspondencias?
- O que acontece quando o usuario digita mais de 2 caracteres incorretos no nome?
- Como o sistema se comporta com conexao lenta durante atualizacao de mapa e sugestoes?
- O que acontece quando o usuario tenta buscar fora da cidade de Sao Paulo no MVP?
- O que acontece quando a combinacao de filtros (cuisine + priceRange + area) nao retorna resultados?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao usuario selecionar um ponto de partida no mapa da cidade de Sao Paulo.
- **FR-002**: O sistema MUST permitir ampliar e reduzir zoom no mapa para alterar a area de busca.
- **FR-003**: O sistema MUST atualizar restaurantes exibidos com base na area visivel apos mudanca de zoom ou deslocamento do mapa.
- **FR-004**: O sistema MUST exibir resultados de restaurantes proximos ao ponto de partida dentro da area ativa do mapa.
- **FR-005**: O sistema MUST oferecer busca por nome de restaurante com sugestoes em tempo de digitacao.
- **FR-006**: O sistema MUST aceitar tolerancia de ate 2 caracteres incorretos na busca por nome e ainda retornar sugestoes relevantes quando houver correspondencia aproximada.
- **FR-007**: O usuario MUST poder selecionar uma sugestao de nome para refinar os resultados exibidos.
- **FR-008**: O sistema MUST combinar filtro geografico e filtro por nome quando ambos estiverem ativos.
- **FR-009**: O sistema MUST informar claramente quando nao houver resultados para a combinacao atual de filtros ativos.
- **FR-010**: O sistema MUST limitar o escopo do MVP a restaurantes na cidade de Sao Paulo.
- **FR-011**: O sistema SHOULD permitir filtrar restaurantes por tipo de culinaria (cuisine).
- **FR-012**: O sistema SHOULD permitir filtrar restaurantes por faixa de preco (priceRange 1–4).
- **FR-013**: O sistema SHOULD exibir avaliacao media (rating) nos cards de resultado.
- **FR-014**: O sistema SHOULD exibir o bairro (neighborhood) nos cards de resultado.
- **FR-015**: O sistema MUST navegar o mapa (flyTo zoom 18) ao restaurante quando o usuario seleciona uma sugestao de autocomplete.
- **FR-016**: O sistema MUST navegar o mapa (flyTo zoom 18) ao restaurante quando o usuario clica em um card da lista de resultados.
- **FR-017**: A endpoint de autocomplete MUST retornar as coordenadas (lat, lng) de cada sugestao para viabilizar a navegação no mapa.
- **FR-018**: O servidor MUST logar no console o filtro ou pipeline MongoDB exato antes de cada execução de query (geo, search compound, autocomplete).
- **FR-019**: O sistema MUST exibir um favicon personalizado (garfo + faca, cores da identidade visual) na aba do navegador.
- **FR-020**: O sistema MUST exibir um marcador de crosshair vermelho fixo no centro do mapa para indicar o ponto de referência do viewport do usuário. O marcador não deve interceptar eventos de interação com o mapa.
- **FR-021**: O sistema MUST calcular e exibir as opções de filtro de culinária e faixa de preço dinamicamente via `$searchMeta facet` do Atlas Search, refletindo apenas os valores presentes nos restaurantes do viewport atual.
- **FR-022**: Os facets MUST incluir contagem de documentos por bucket para cada opção exibida.
- **FR-023**: Os facets MUST ser recalculados sempre que o viewport mudar (com debounce de 400ms para não disparar a cada pixel de pan).

### Quality, UX, and Performance Requirements *(mandatory)*

- **NFR-001 (Code Quality)**: A especificacao MUST manter separacao clara entre comportamento de negocio, interacao de mapa e experiencia de busca.
- **NFR-002 (Testing)**: Cada requisito funcional MUST possuir cenario de validacao correspondente em nivel de historia de usuario.
- **NFR-003 (UX Consistency)**: A interface MUST apresentar estados consistentes de carregamento, vazio, sucesso e erro para mapa e busca textual.
- **NFR-004 (Performance)**: A atualizacao de resultados apos interacao de mapa ou digitacao MUST ocorrer em tempo percebido como responsivo para navegacao fluida.
- **NFR-005 (Compatibility)**: O MVP MUST funcionar em navegadores desktop e mobile modernos sem exigir instalacao adicional.

### Key Entities *(include if feature involves data)*

- **Restaurant**: Representa um restaurante exibivel, com nome, coordenadas geograficas, bairro, tipo de culinaria, faixa de preco, avaliacao e atributos de exibicao.
- **MapViewport**: Representa o recorte geografico ativo definido por centro, nivel de zoom e bounding box.
- **SearchQuery**: Representa o texto digitado pelo usuario para busca por nome e estado de selecao de sugestao.
- **SearchSession**: Representa a sessao de busca ativa, combinando viewport, query textual e filtros, e produzindo o conjunto de resultados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes de aceitacao, 95% das interacoes de mover mapa e alterar zoom atualizam os resultados em ate 2 segundos.
- **SC-002**: Em um conjunto de consultas de validacao, ao menos 90% das buscas com ate 2 caracteres incorretos retornam ao menos uma sugestao relevante quando existir correspondencia no catalogo.
- **SC-003**: Pelo menos 90% dos usuarios de teste conseguem localizar um restaurante proximo ao ponto escolhido no mapa sem suporte externo.
- **SC-004**: Em cenarios sem resultados, 100% das execucoes exibem feedback claro de vazio sem falha de interface.
- **SC-005**: Nenhum erro critico bloqueador e observado no fluxo principal de mapa + busca nominal durante testes de demonstracao do MVP.
- **SC-006**: 100% dos requisitos funcionais possuem ao menos um cenario de aceitacao rastreavel nas historias do documento.
- **SC-007**: Em revisao de UX, nao sao identificadas inconsistencias de estado entre lista, mapa e campo de busca nos fluxos principais.
- **SC-008**: O fluxo principal de descoberta (abrir mapa, selecionar ponto e visualizar restaurantes) e concluido em ate 60 segundos por usuarios de primeira viagem em ambiente de teste.
- **SC-009**: Em testes de filtragem, 100% das combinacoes de cuisine + priceRange + area retornam apenas resultados que satisfazem todos os filtros ativos simultaneamente.

## Assumptions

- O MVP sera focado exclusivamente na cidade de Sao Paulo e nao cobrira outras cidades nesta fase.
- Filtros por cuisine e priceRange sao incluidos no MVP como forma de demonstrar as capacidades de facets e filtros compostos do Atlas Search.
- A base de dados sera populada via script de seed com 1.000 restaurantes reais obtidos do OpenStreetMap (Overpass API), com geolocalizacao verificada e enderecos reais, cobrindo ao menos 25 bairros de Sao Paulo, antes da primeira demonstracao.
- O usuario acessara a aplicacao com conexao de internet funcional durante a demonstracao.
- O objetivo principal desta fase e validar a experiencia de descoberta geoespacial e textual em uma demonstracao funcional.
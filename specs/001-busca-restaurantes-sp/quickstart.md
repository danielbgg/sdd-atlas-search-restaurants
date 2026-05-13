# Quickstart: Busca de Restaurantes em Sao Paulo (MVP)

## Objetivo

Validar rapidamente o fluxo principal do MVP: mapa de Sao Paulo + busca de restaurantes por geolocalizacao e nome com autocomplete fuzzy.

## Pre-requisitos

- Ambiente com acesso ao banco configurado para a base de restaurantes.
- Dataset com restaurantes da cidade de Sao Paulo e coordenadas validas.
- Variaveis de ambiente disponiveis para conexao e configuracao de app.

## Passos de execucao (alto nivel)

1. Inicie os servicos da aplicacao (frontend e backend).
2. Abra a interface principal no navegador.
3. Posicione o mapa em Sao Paulo e selecione um ponto de partida.
4. Ajuste zoom para alterar o recorte de busca.
5. Verifique atualizacao de marcadores/lista com restaurantes proximos.
6. Digite o nome de um restaurante no campo de busca e confirme sugestoes.
7. Teste digitacao com ate 2 erros para validar fuzzy matching.
8. Selecione uma sugestao e confirme refinamento combinado (texto + localizacao).

## Cenarios de verificacao rapida

- Cenario A: Busca apenas por mapa retorna restaurantes da area visivel.
- Cenario B: Autocomplete retorna sugestoes relevantes para prefixo valido.
- Cenario C: Autocomplete retorna sugestoes com ate 2 caracteres incorretos.
- Cenario D: Combinacao de mapa + nome restringe resultados corretamente.
- Cenario E: Estado vazio e exibido quando nao ha resultado para filtros ativos.

## Metas de aceite operacional

- Atualizacao de resultados em ate 2s para interacao comum de pan/zoom.
- Sugestoes de autocomplete retornadas em tempo responsivo para digitacao.
- Nenhum erro bloqueador no fluxo principal durante demonstracao.

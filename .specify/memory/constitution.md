<!--
Sync Impact Report
- Version change: N/A (template inicial) -> 1.0.0
- Modified principles:
	- N/A -> I. Qualidade de Código como Padrão Mínimo
	- N/A -> II. Estratégia de Testes Obrigatória
	- N/A -> III. Consistência de Experiência do Usuário
	- N/A -> IV. Orçamento de Desempenho e Regressão Zero
	- N/A -> V. Manutenibilidade e Evolução Segura
- Added sections:
	- Requisitos Operacionais Mínimos
	- Fluxo de Entrega e Gates de Qualidade
- Removed sections:
	- Nenhuma
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (diretório não existe no repositório)
- Follow-up TODOs:
	- Nenhum
-->

# AI Atlas Search Restaurants Constitution

## Core Principles

### I. Qualidade de Código como Padrão Mínimo
Todo código novo ou alterado MUST ser legível, modular e revisável em PR. Cada mudança
MUST manter convenções do repositório, evitar duplicação desnecessária e incluir
tratamento explícito de erros para fluxos esperados. Refatorações sem cobertura adequada
ou com aumento de complexidade sem justificativa técnica documentada são proibidas.
Rationale: qualidade consistente reduz defeitos, simplifica manutenção e acelera evolução.

### II. Estratégia de Testes Obrigatória
Cada requisito funcional MUST mapear para testes verificáveis. Mudanças de comportamento
MUST incluir testes unitários e, quando houver fronteiras de integração, testes de
integração ou contrato. Bugs corrigidos MUST incluir teste de regressão que falha antes
da correção. Nenhuma entrega pode ser considerada pronta com testes quebrados ou
cenários críticos sem cobertura declarada e aprovada.
Rationale: disciplina de testes evita regressão e transforma requisitos em evidências.

### III. Consistência de Experiência do Usuário
Fluxos de UX MUST manter nomenclatura, estados, mensagens e feedback visual consistentes
entre telas e interações equivalentes. Qualquer nova interface MUST definir estados de
carregamento, vazio, sucesso e erro de forma coerente com o produto. Mudanças de UX que
introduzam fricção adicional MUST apresentar justificativa baseada em necessidade de
negócio, acessibilidade ou confiabilidade.
Rationale: consistência melhora previsibilidade, confiança e taxa de conclusão de tarefas.

### IV. Orçamento de Desempenho e Regressão Zero
Cada feature MUST declarar metas de desempenho mensuráveis (ex.: latência p95, tempo de
renderização, uso de memória, throughput), e a implementação MUST demonstrar que não
introduz regressão frente ao baseline acordado. Alterações que ultrapassem o orçamento
MUST ser bloqueadas até haver mitigação, exceção formalmente aprovada ou revisão do
orçamento com evidência técnica.
Rationale: desempenho é requisito funcional para experiência e escalabilidade.

### V. Manutenibilidade e Evolução Segura
Todo trabalho MUST preservar capacidade de evolução segura: contratos versionados quando
necessário, documentação de decisões relevantes, e plano de migração para mudanças que
afetem consumidores existentes. Decisões irreversíveis MUST registrar trade-offs e
critérios de rollback.
Rationale: evolução previsível evita custos acumulados e risco operacional.

## Requisitos Operacionais Mínimos

- Linguagem, framework e dependências MUST ser declarados no plano de implementação.
- Todo PR MUST incluir evidência de testes executados e impacto de desempenho.
- Histórias MUST ser entregáveis e testáveis de forma independente.
- Requisitos de UX MUST incluir critérios de aceitação observáveis pelo usuário final.
- Exceções aos princípios MUST ser raras, temporárias e aprovadas com prazo de remoção.

## Fluxo de Entrega e Gates de Qualidade

1. Especificação MUST definir critérios de sucesso mensuráveis para qualidade, UX e
	 desempenho.
2. Plano MUST explicitar Constitution Check com gates objetivos para os cinco princípios.
3. Tasks MUST incluir atividades de testes, validação de UX e verificação de desempenho.
4. Revisão de PR MUST validar conformidade constitucional antes de merge.
5. Release MUST registrar riscos residuais e plano de monitoramento pós-entrega.

## Governance

Esta constituição prevalece sobre práticas locais conflitantes. Toda alteração nesta
constituição MUST registrar motivação, impacto esperado, e plano de migração quando
aplicável. Política de versionamento:

- MAJOR: remoção ou redefinição incompatível de princípios ou de governance.
- MINOR: adição de princípio, seção, ou expansão material de obrigações.
- PATCH: clarificações editoriais sem alteração de obrigações normativas.

Compliance MUST ser revisado em cada PR através do Constitution Check no plano e da
validação de tarefas/artefatos gerados. Não conformidades MUST ser corrigidas antes de
merge ou aprovadas como exceção temporal com owner e data de expiração.

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13

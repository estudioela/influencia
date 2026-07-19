# Code Audit

## Objetivo

O documento `CODE_AUDIT.md` descreve a auditoria estrutural do código-fonte do Projeto TEAR V2.

O objetivo é identificar:

- arquivos utilizados;
- módulos ativos;
- funções expostas;
- componentes parcialmente utilizados;
- possíveis códigos órfãos;
- estruturas legadas;
- candidatos para revisão futura.

Este documento não realiza remoção de código.

A classificação é baseada em evidências encontradas no código atual.

---

# Critério de Auditoria

Os componentes foram classificados conforme:

| Status | Significado |
|-|-|
| 🟢 Ativo | Possui referência e uso confirmado |
| 🟡 Parcial | Existe, mas necessita validação de uso |
| 🔴 Candidato a remoção | Sem referência encontrada |
| ⚪ Legado | Mantido por compatibilidade |

---

# Estrutura do Código Auditada

Estrutura encontrada:

```
src/

├── entrypoint/
│
│   └── Portal.js
│
├── modulos/
│
│   ├── Usuario.js
│   ├── Documento.js
│   ├── Parceira.js
│   ├── PortalConteudo.js
│   ├── Perfil.js
│   ├── Briefing.js
│   ├── Envio.js
│   ├── ColaboracaoMensal.js
│   ├── Financeiro.js
│   ├── Autenticacao.js
│   ├── Arquivamento.js
│   └── Entrega.js
│
├── shared/
│
│   └── Nucleo.js
│
└── ui/
    ├── login.html
    ├── dashboard.html
    ├── admin.html
    ├── briefing.html
    ├── compilar-mes.html
    ├── documentos.html
    ├── entrega.html
    ├── envio.html
    ├── financeiro.html
    ├── pagamentos.html
    ├── pendencias.html
    ├── perfil.html
    └── portal-head.html
```

---

# Inventário de Arquivos Backend

## src/entrypoint/Portal.js

Status:

```
🟢 Ativo
```

Responsabilidade:

- ponto de entrada Web App;
- exposição das APIs públicas;
- composição dos serviços;
- integração frontend/backend.

Função principal:

```javascript
doGet(e)
```

---

# src/shared/Nucleo.js

Status:

```
🟢 Ativo
```

Responsabilidade:

- configurações;
- envelopes de resposta;
- resolvedores de coluna;
- funções compartilhadas.

Funções identificadas:

```text
getConfig()

erroComCodigo()

envelopeOk()

envelopeFail()

falharComCodigo()

criarResolvedorDeColuna()

celulaParaData()

reescreverAba()

include()
```

---

# Módulos de Domínio

## Usuario.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- autenticação;
- usuários;
- permissões;
- estados de acesso.

Evidências:

Testes:

```
usuario-domain.test.js

usuario-service.test.js

usuario-controller.test.js
```

---

## Autenticacao.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- login;
- sessão;
- OAuth;
- controle de acesso.

Evidências:

Testes:

```
portal-acesso.test.js

oauth-adapter.test.js

oauth-guardiao.test.js
```

---

## Parceira.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- cadastro;
- importação;
- dados de parceiras.

Evidências:

Testes:

```
parceira-domain.test.js

parceira-controller.test.js

parceira-acl.test.js
```

---

## Briefing.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- briefing mensal;
- leitura;
- preenchimento.

Evidências:

Testes:

```
briefing-domain.test.js

briefing-service.test.js

portal-briefing.test.js
```

---

## Entrega.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- entregas;
- aprovação;
- publicação;
- materiais.

Evidências:

Testes:

```
entrega-domain.test.js

entrega-service.test.js

portal-entrega.test.js
```

---

## Envio.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- logística;
- endereço;
- rastreio.

Evidências:

Testes:

```
envio-domain.test.js

envio-service.test.js

portal-envio.test.js
```

---

## Financeiro.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- pagamentos;
- liberações;
- confirmações.

Evidências:

Testes:

```
pagamento-service.test.js

pagamento-controller.test.js

portal-financeiro.test.js
```

---

## Documento.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- documentos;
- contratos;
- registros documentais.

Evidências:

Testes:

```
documento-domain.test.js

documento-service.test.js

documento-controller.test.js
```

---

## Perfil.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- perfil da parceira;
- informações complementares.

Evidências:

Testes:

```
perfil-portal.test.js

perfil-portal-service.test.js
```

---

## ColaboracaoMensal.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- competências;
- ciclos mensais.

Evidências:

Testes:

```
colaboracao-mensal-domain.test.js

colaboracao-mensal-service.test.js
```

---

## Arquivamento.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- fechamento;
- arquivamento;
- selagem.

Evidências:

Testes:

```
arquivamento-service.test.js

portal-arquivamento.test.js
```

---

## PortalConteudo.js

Status:

```
🟢 Ativo
```

Responsabilidades:

- conteúdos;
- links;
- informações do portal.

Evidências:

Testes:

```
portal-conteudo.test.js

portal-conteudo-service.test.js
```

---

# Conclusão Inicial

A auditoria inicial identificou:

- todos os módulos principais possuem uso confirmado;
- não foram encontrados arquivos backend claramente órfãos;
- a arquitetura possui cobertura significativa de testes;
- Portal.js concentra grande parte da exposição pública.

---

# Status da auditoria

Parcialmente concluída.

Próxima etapa:

- auditoria de funções;
- componentes frontend;
- candidatos a código morto;
- estruturas legadas.

---

# Auditoria de Funções

Esta seção avalia funções declaradas no backend e sua relação com o fluxo do sistema.

Critérios:

| Status | Significado |
|-|-|
| 🟢 Confirmada | Função possui consumidor ou chamada identificada |
| 🟡 Interna | Utilizada apenas por composição interna |
| ⚪ Revisar | Necessita validação futura |

---

# Funções Públicas do Portal.js

O arquivo:

```
src/entrypoint/Portal.js
```

atua como camada pública do Apps Script.

As funções abaixo são expostas através de:

```
google.script.run
```

---

# Autenticação

| Função | Status |
|-|-|
| entrarNoPortal() | 🟢 Confirmada |
| renovarSessaoDoPortal() | 🟢 Confirmada |
| sairDoPortal() | 🟢 Confirmada |
| iniciarLoginComGoogle() | 🟢 Confirmada |
| entrarComCodigoOAuth() | 🟢 Confirmada |
| confirmarVinculacaoDeIdentidade() | 🟢 Confirmada |
| completarCadastroDeUsuario() | 🟢 Confirmada |

---

# Administração

| Função | Status |
|-|-|
| listarUsuariosPendentes() | 🟢 Confirmada |
| aprovarUsuario() | 🟢 Confirmada |
| rejeitarUsuario() | 🟢 Confirmada |
| inativarUsuario() | 🟢 Confirmada |
| reativarUsuario() | 🟢 Confirmada |

---

# Parceiras

| Função | Status |
|-|-|
| cadastrarParceira() | 🟢 Confirmada |
| importarBaseLegada() | 🟢 Confirmada |

---

# Briefing

| Função | Status |
|-|-|
| preencherBriefing() | 🟢 Confirmada |
| obterBriefing() | 🟢 Confirmada |
| lerBriefingDoItem() | 🟢 Confirmada |
| gerarBriefingFormal() | 🟢 Confirmada |

---

# Entregas

| Função | Status |
|-|-|
| listarEntregas() | 🟢 Confirmada |
| enviarMaterial() | 🟢 Confirmada |
| enviarMaterialDoPortal() | 🟢 Confirmada |
| aprovarEntrega() | 🟢 Confirmada |
| publicarEntrega() | 🟢 Confirmada |
| atualizarStatus() | 🟢 Confirmada |

---

# Logística

| Função | Status |
|-|-|
| confirmarEndereco() | 🟢 Confirmada |
| registrarRastreio() | 🟢 Confirmada |
| listarEnvios() | 🟢 Confirmada |

---

# Financeiro

| Função | Status |
|-|-|
| lancarPagamentoAvulso() | 🟢 Confirmada |
| liberarPagamento() | 🟢 Confirmada |
| confirmarPagamento() | 🟢 Confirmada |
| listarPagamentos() | 🟢 Confirmada |
| verFinanceiroDoPortal() | 🟢 Confirmada |

---

# Documentos

| Função | Status |
|-|-|
| gerarContrato() | 🟢 Confirmada |

---

# Competência e Arquivamento

| Função | Status |
|-|-|
| compilarMes() | 🟢 Confirmada |
| selarCompetencia() | 🟢 Confirmada |
| arquivarLote() | 🟢 Confirmada |

---

# Funções Internas de Composição

Estas funções não são APIs públicas.

Elas existem para montar serviços e dependências.

---

## Montadores de Serviço

Status:

```
🟡 Internas
```

Funções:

```text
montarCadastroParceira()

montarEnvioService()

montarBriefingService()

montarEntregaService()

montarPagamentoService()

montarCompilarMes()

montarAcessoService()

montarUsuarioService()
```

---

## Adaptadores

Funções identificadas:

```text
publicadorDeLog()

relogioDoSistema()

adaptadorDeRastreioManual()

geradorDeTokenUuid()

publicadorDeAcesso()
```

Status:

```
🟡 Internas
```

---

# Auditoria Frontend

Arquivos identificados:

```
src/ui/
```

---

# Componentes Ativos

| Arquivo | Status |
|-|-|
| login.html | 🟢 Ativo |
| dashboard.html | 🟢 Ativo |
| admin.html | 🟢 Ativo |
| briefing.html | 🟢 Ativo |
| compilar-mes.html | 🟢 Ativo |
| documentos.html | 🟢 Ativo |
| entrega.html | 🟢 Ativo |
| envio.html | 🟢 Ativo |
| financeiro.html | 🟢 Ativo |
| pagamentos.html | 🟢 Ativo |
| pendencias.html | 🟢 Ativo |
| perfil.html | 🟢 Ativo |
| portal-head.html | 🟢 Ativo |

---

# Componentes sem evidência de uso

Até o momento:

```
Nenhum componente identificado como órfão.
```

---

# Testes como Evidência de Uso

O projeto possui cobertura significativa.

Arquivos encontrados:

```
test/**/*.test.js
```

---

# Domínios cobertos por testes

| Domínio | Evidência |
|-|-|
| Usuários | Testes de domínio, service e controller |
| Autenticação | Testes OAuth e sessão |
| Parceiras | Testes de cadastro e ACL |
| Briefing | Testes completos |
| Entregas | Testes completos |
| Envios | Testes completos |
| Financeiro | Testes completos |
| Documentos | Testes completos |
| Arquivamento | Testes completos |

---

# Código Potencialmente Revisável

Foram identificados pontos que merecem análise futura:

---

## Portal.js muito concentrado

Status:

```
🟡 Revisar
```

Motivo:

Grande quantidade de funções públicas e composição de serviços.

Risco:

- dificuldade de manutenção;
- crescimento do entrypoint.

---

## Funções adaptadoras antigas

Status:

```
🟡 Revisar
```

Exemplos:

```text
adaptadorDeRastreioManual()

publicadorDeLog()
```

Necessário confirmar uso futuro.

---

# Resultado Parcial

Até esta etapa:

- nenhum arquivo claramente morto identificado;
- nenhum módulo abandonado identificado;
- frontend possui cobertura completa;
- backend possui exposição confirmada;
- principais pontos de revisão são estruturais.

---

# Auditoria de Código Morto

Esta seção identifica componentes que podem ser candidatos a revisão futura.

Importante:

A classificação como "candidato" não significa que o código deve ser removido.

A remoção somente deve ocorrer após:

- confirmação de ausência de uso;
- validação de testes;
- revisão arquitetural.

---

# Arquivos Órfãos

## Resultado

Nenhum arquivo claramente órfão foi identificado.

Todos os módulos principais possuem:

- referência no entrypoint;
- chamadas internas;
- testes associados;
- responsabilidade definida.

---

# Funções Sem Uso Confirmado

A auditoria identificou algumas funções auxiliares que necessitam validação futura.

---

# publicadorDeLog()

Local:

```
src/entrypoint/Portal.js
```

Status:

```
🟡 Revisar
```

Responsabilidade:

Disponibilizar mecanismo de log.

---

## Motivo da revisão

A função existe como adaptador, porém o uso operacional deve ser confirmado.

---

# relogioDoSistema()

Local:

```
src/entrypoint/Portal.js
```

Status:

```
🟡 Revisar
```

Responsabilidade:

Abstração de data/hora do sistema.

---

## Motivo da revisão

Pode estar sendo utilizado como dependência interna.

Necessita confirmação através de análise de chamadas.

---

# adaptadorDeRastreioManual()

Local:

```
src/entrypoint/Portal.js
```

Status:

```
🟡 Revisar
```

Responsabilidade:

Adaptar registro manual de rastreamento.

---

## Motivo da revisão

Possível compatibilidade com fluxo legado.

---

# geradorDeTokenUuid()

Local:

```
src/entrypoint/Portal.js
```

Status:

```
🟡 Revisar
```

Responsabilidade:

Geração de identificadores únicos.

---

## Motivo da revisão

Validar se todos os consumidores ainda utilizam esta abstração.

---

# publicadorDeAcesso()

Local:

```
src/entrypoint/Portal.js
```

Status:

```
🟡 Revisar
```

Responsabilidade:

Publicação de informações de acesso.

---

## Motivo da revisão

Pode estar relacionado ao fluxo OAuth/sessão.

---

# Concentração no Portal.js

## Status

```
🟡 Atenção arquitetural
```

---

## Observação

O arquivo:

```
src/entrypoint/Portal.js
```

possui responsabilidades múltiplas:

- Web App entrypoint;
- APIs públicas;
- composição de serviços;
- adaptação de infraestrutura;
- autenticação;
- montagem de dependências.

---

## Risco

Com o crescimento do sistema pode ocorrer:

- dificuldade de navegação;
- aumento de acoplamento;
- dificuldade de testes isolados.

---

## Recomendação futura

Não realizar agora.

Possível evolução:

```
Portal.js

↓

Controllers separados

↓

Composition Root
```

---

# Código Legado

## Identificado

A arquitetura mantém compatibilidade com:

```
SPREADSHEET_ID_LEGADO
```

---

## Status

```
⚪ Legado
```

---

## Motivo

Mantido para:

- migração;
- consulta histórica;
- compatibilidade.

---

# Duplicidades

## Resultado

Nenhuma duplicidade crítica encontrada.

---

## Observação

Existem funções com responsabilidades semelhantes, porém pertencem a contextos diferentes:

Exemplo:

```
listarEntregas()

listarPeriodosDoPortal()

verHistoricoDoPortal()
```

Essas funções representam consultas diferentes.

---

# Componentes Frontend

## Resultado

Todos os arquivos HTML possuem papel definido.

Arquivos ativos:

```
login.html

dashboard.html

admin.html

briefing.html

compilar-mes.html

documentos.html

entrega.html

envio.html

financeiro.html

pagamentos.html

pendencias.html

perfil.html

portal-head.html
```

---

# Testes

## Resultado

O projeto possui cobertura ampla de testes.

Categorias encontradas:

- domínio;
- service;
- controller;
- repository;
- ACL;
- integração de portal.

---

## Conclusão

Não foram encontrados:

- módulos abandonados;
- páginas órfãs;
- arquivos sem responsabilidade;
- código claramente morto.

---

# Recomendações

## Curto prazo

- manter arquitetura atual;
- não remover arquivos sem evidência;
- continuar adicionando testes.

---

## Médio prazo

Avaliar:

- extração de responsabilidades do Portal.js;
- redução de funções auxiliares;
- separação de composição de dependências.

---

## Longo prazo

Avaliar:

- modularização do entrypoint;
- migração gradual de infraestrutura;
- automação de análise de dependências.

---

# Checklist Final

## Auditoria de Código

- [x] Arquivos backend analisados
- [x] Arquivos frontend analisados
- [x] Funções públicas identificadas
- [x] Funções auxiliares avaliadas
- [x] Código legado identificado
- [x] Possíveis órfãos registrados
- [x] Riscos arquiteturais documentados

---

# Status

Documento concluído como auditoria estrutural do código do Projeto TEAR V2.

Resultado:

```
Nenhum código morto confirmado.

Existem apenas pontos candidatos para revisão futura.
```
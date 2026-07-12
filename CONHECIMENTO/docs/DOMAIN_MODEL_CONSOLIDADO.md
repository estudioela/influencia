# DOMAIN_MODEL_CONSOLIDADO.md — Verdade de Domínio V2

> Documento consolidado de domínio do Projeto TEAR.
> Este documento descreve o estado-alvo soberano (V2) e substitui leituras conflitantes baseadas em Ciclo/Plano.
>
> Fontes de autoridade:
> - CONTRATO_SOBERANO.md
> - DOMAIN_MODEL_V2.md
> - PLANILHA_TEAR_2.0_MAPA.md
> - DIRETRIZES_DE_ENGENHARIA_PARA_O_PROJETO_TEAR.md
>
> Nota de transição:
> O código atual ainda possui trechos operando no modelo legado Ciclo/Plano. Isso e tratado como divida tecnica em migracao. A referencia de negocio continua sendo este modelo V2.

## 1. Decisão Arquitetural

- O Soberano V2 vence qualquer documento legado.
- O dominio e definido por linguagem de negocio, nao por colunas de planilha.
- Persistencia fisica existe apenas por meio da ACL.
- Os termos Ciclo e Plano de Colaboracao sao banidos do vocabulário de dominio V2.

## 2. Linguagem Ubiqua Oficial

- Parceira: entidade central e fonte unica de condicao comercial.
- Cadastro: entrada candidata a promocao para Parceira.
- Colaboracao Mensal: compromisso de uma Parceira em um MesReferencia.
- MesReferencia: VO temporal MM/AAAA, sem entidade dedicada.
- Compilador do Mes: operacao que materializa a colaboracao mensal.
- Briefing: orientacao criativa do mes.
- Ativacao: entregavel unitario de conteudo.
- EnvioLogistico: jornada de envio fisico.
- Pagamento: cache devido pelo mes.
- Arquivamento: encerramento imutavel da competencia.

## 3. Estrutura de Dominio

### 3.1 Value Objects

- ChaveInfluenciadora
- MesReferencia
- PIX
- CNPJ
- Endereco
- CondicaoComercial

### 3.2 Agregados e Entidades

- Agregado raiz: Parceira
- Entidade de entrada: Cadastro
- Fronteira logica por competencia: Colaboracao Mensal
  - Briefing
  - Ativacao
  - EnvioLogistico
  - Pagamento
- Historico: registros imutaveis de competencias arquivadas

## 4. Regras Estruturais

- Parceira e a origem do valor comercial do mes.
- Pagamento espelha a condicao comercial da Parceira no contexto mensal.
- Nenhuma camada fora da ACL cita coluna fisica de planilha.
- Nomes de coluna sao detalhe de infraestrutura.
- Dados sensiveis (PII: PIX, CNPJ, Endereco) nao podem ir para logs.

## 5. Eventos de Dominio (fatos)

- CadastroRecebido
- ParceiraPromovida
- MesCompilado
- BriefingPublicado
- ConteudoEnviado
- ConteudoAprovado
- ProdutoDespachado
- ProdutoEntregue
- PagamentoLiberado
- PagamentoConfirmado
- CompetenciaArquivada

## 6. Contrato de Convivencia com o Legado

Enquanto a migracao do codigo nao termina:

- O modelo legado Ciclo/Plano e reconhecido apenas como estado tecnico temporario.
- Decisoes de produto e documentacao de negocio continuam ancoradas no V2 soberano.
- Divergencia entre implementacao atual e modelo V2 deve virar item de migracao, nunca revisao do soberano.

## 7. Escopo deste documento

Este documento consolida o dominio. Nao descreve:

- detalhes operacionais de execucao diaria;
- roteiro de deploy;
- historico de alteracoes;
- backlog de implementacao.

Esses temas ficam em documentos proprios.

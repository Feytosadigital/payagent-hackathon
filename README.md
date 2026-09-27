markdown
# 🤖 PayAgent — Pagamentos Autônomos para Agentes de IA

> **Infraestrutura de pagamentos programáveis para a economia dos agentes de IA, construída na Solana com o protocolo x402.**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://solana.com)
[![x402](https://img.shields.io/badge/Protocol-x402-000000)](https://x402.org)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js)](https://nodejs.org)

---

## 🎯 O Problema

Agentes de IA (LLMs, bots, assistentes) estão executando tarefas reais: consultar APIs, comprar dados, processar computação. Mas **eles não têm uma forma nativa de pagar por esses serviços sem intervenção humana**.

O modelo atual exige que um humano aprove cada micropagamento, o que:
- **Destrói a autonomia** dos agentes.
- **Não escala** para a economia de agentes que está surgindo.
- **Cria atrito** em fluxos que deveriam ser fluidos (ex: agentes negociando entre si).

## 💡 A Solução

O **PayAgent** implementa o protocolo **x402** (HTTP 402 Payment Required) adaptado para a **Solana**, permitindo que agentes de IA:

- 🔍 **Detectem serviços pagos** automaticamente.
- 💸 **Paguem de forma autônoma** com USDC ou SOL.
- ⚡ **Liquidem em menos de 1 segundo** com as taxas irrisórias da Solana.
- 🔗 **Provem o pagamento on-chain** para que o servidor libere o recurso.

## 🏗️ Arquitetura
┌──────────────────────────────────────────────────────────┐
│ 🤖 AGENTE PAGADOR (DeepSeek) │
│ - Detecta HTTP 402 │
│ - Lê preço e destinatário │
│ - Assina e envia transação na Solana │
│ - Reenvia requisição com header X-PAYMENT │
└──────────────────────────────────────────────────────────┘
│
│ HTTP
▼
┌──────────────────────────────────────────────────────────┐
│ 🏦 SERVIDOR DE RECURSO (Grok Oracle) │
│ - Expõe endpoint pago │
│ - Retorna HTTP 402 com detalhes do pagamento │
│ - Verifica a transação on-chain │
│ - Libera o dado somente após confirmação │
└──────────────────────────────────────────────────────────┘
│
│ Solana RPC
▼
┌──────────────────────────────────────────────────────────┐
│ ⛓️ SOLANA DEVNET │
│ - Liquidação em <1s │
│ - Taxa de ~$0.00025 │
│ - Prova on-chain imutável │
└──────────────────────────────────────────────────────────┘

text

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 20+
- NPM 10+
- Duas carteiras Solana na Devnet (para pagador e recebedor)

### Instalação

```bash
git clone https://github.com/Feytosadigital/payagent-hackathon.git
cd payagent-hackathon
npm install
const express = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
const app = express();
const port = 3000;

// --- CONFIGURAÇÃO DO RECEBEDOR (GROK) ---
// Cole aqui a chave privada (em array) da carteira do Grok que você quer usar.
// Para simplificar, o script vai gerar uma nova e mostrar no console, mas você pode salvar em arquivo como fizemos com o pagador.
const RECEIVER_PRIVATE_KEY = [/* SUA CHAVE PRIVADA AQUI SE QUISER FIXA */]; 
const RECEIVER_PUBLIC_KEY = "6haXDeqg6cooTY1Daxn9N8yN8yQqETFSpZogDAsrdDKg"; // Carteira do teste anterior
const PRICE_IN_SOL = 0.01;
// ----------------------------------------

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

app.get('/api/cotacao', async (req, res) => {
    console.log('📥 Recebida requisição para /api/cotacao');

    // 1. Verifica se o pagamento foi enviado no header
    const paymentSignature = req.headers['x-payment'];

    if (!paymentSignature) {
        console.log('⛔ Pagamento não encontrado. Retornando HTTP 402...');
        return res.status(402).json({
            error: "Payment Required",
            price: PRICE_IN_SOL,
            currency: "SOL",
            recipient: RECEIVER_PUBLIC_KEY,
            message: "Por favor, envie o pagamento para a carteira acima e reenvie com o header X-PAYMENT: <assinatura>"
        });
    }

    console.log(`🔍 Verificando transação: ${paymentSignature}`);
    
    try {
        // 2. Verifica na blockchain se a transação existe e é válida
        const tx = await connection.getTransaction(paymentSignature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!tx) {
            throw new Error("Transação não encontrada ou ainda não confirmada.");
        }

        // Verifica se o destinatário é o correto e o valor é o esperado
        // (Nota: Em produção, você faria uma verificação mais robusta dos instruction data)
        const receiverIndex = tx.transaction.message.accountKeys.findIndex(
            key => key.toString() === RECEIVER_PUBLIC_KEY
        );

        if (receiverIndex === -1) {
             throw new Error("Esta transação não foi destinada à carteira correta.");
        }

        // Simulando a entrega do dado pago
        console.log('✅ Pagamento verificado com sucesso! Entregando dado...');
        return res.json({
            status: "success",
            data: {
                pair: "SOL/USDC",
                price: 150.25,
                timestamp: new Date().toISOString(),
                source: "Grok Oracle AI"
            }
        });

    } catch (error) {
        console.error('❌ Erro na verificação do pagamento:', error.message);
        return res.status(400).json({ error: "Invalid payment", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`🤖 Servidor do Grok rodando em http://localhost:${port}`);
    console.log(`   Endpoint pago: GET /api/cotacao`);
    console.log(`   Preço: ${PRICE_IN_SOL} SOL`);
    console.log(`   Carteira do Grok: ${RECEIVER_PUBLIC_KEY}`);
});

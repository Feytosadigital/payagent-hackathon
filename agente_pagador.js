const { 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    Transaction, 
    SystemProgram, 
    sendAndConfirmTransaction,
    PublicKey
} = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const RPC_URL = 'https://api.devnet.solana.com';
const WALLET_FILE = path.join(__dirname, 'payer_wallet.json');
const GROK_API_URL = 'http://localhost:3000/api/cotacao'; // Servidor do Grok rodando localmente

async function loadOrCreateWallet() {
    if (fs.existsSync(WALLET_FILE)) {
        const secretKeyString = fs.readFileSync(WALLET_FILE, 'utf8');
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return Keypair.fromSecretKey(secretKey);
    } else {
        const newKeypair = Keypair.generate();
        fs.writeFileSync(WALLET_FILE, JSON.stringify(Array.from(newKeypair.secretKey)));
        return newKeypair;
    }
}

async function main() {
    console.log('🤖 Agente DeepSeek iniciando...');
    const connection = new Connection(RPC_URL, 'confirmed');
    const payer = await loadOrCreateWallet();
    const balance = await connection.getBalance(payer.publicKey);
    
    console.log(`💰 Saldo: ${balance / LAMPORTS_PER_SOL} SOL`);

    try {
        console.log('\n🌐 Solicitando cotação ao Grok (sem pagamento)...');
        
        // 1. Primeira tentativa: sem pagamento
        const response = await axios.get(GROK_API_URL);
        console.log('✅ Dados recebidos (não deveria acontecer sem pagar!):', response.data);
        
    } catch (error) {
        if (error.response && error.response.status === 402) {
            console.log('⛔ Recebido HTTP 402 Payment Required');
            const paymentDetails = error.response.data;
            console.log(`   Preço exigido: ${paymentDetails.price} SOL`);
            console.log(`   Carteira do Grok: ${paymentDetails.recipient}`);

            // 2. Executar o pagamento
            console.log('\n💸 Efetuando pagamento autônomo...');
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: new PublicKey(paymentDetails.recipient),
                    lamports: paymentDetails.price * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
            console.log(`✅ Pagamento enviado! Assinatura: ${signature}`);

            // 3. Segunda tentativa: com o comprovante de pagamento
            console.log('\n🔄 Reenviando requisição com o comprovante...');
            const paidResponse = await axios.get(GROK_API_URL, {
                headers: {
                    'X-PAYMENT': signature
                }
            });

            console.log('\n🎉 SUCESSO! Dado recebido do Grok:');
            console.log(JSON.stringify(paidResponse.data, null, 2));
            
            console.log('\n🔗 Prova on-chain do pagamento:');
            console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        } else {
            console.error('❌ Erro inesperado:', error.message);
            if (error.response) {
                console.error('Detalhes:', error.response.data);
            }
        }
    }
}

main().then(() => process.exit(0)).catch((err) => {
    console.error('❌ Erro crítico:', err);
    process.exit(1);
});













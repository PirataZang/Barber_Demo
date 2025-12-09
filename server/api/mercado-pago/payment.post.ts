import { defineEventHandler, readBody } from 'h3';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const body = await readBody(event);

  // 1. Configure o cliente do Mercado Pago com seu Access Token
  const client = new MercadoPagoConfig({
    accessToken: runtimeConfig.mercadopagoAccessToken,
  });

  // 2. Crie a instância de pagamento
  const payment = new Payment(client);

  try {
    // 3. Efetue o pagamento com os dados recebidos do frontend
    // O 'idempotencyKey' é importante para evitar pagamentos duplicados em caso de falhas de rede
    const paymentResult = await payment.create({
      body,
      requestOptions: {
        idempotencyKey: event.node.req.headers['x-idempotency-key'] as string | undefined,
      },
    });

    // 4. Retorne o resultado do pagamento para o frontend
    return {
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      id: paymentResult.id,
    };

  } catch (error: any) {
    console.error('Erro ao processar pagamento com Mercado Pago:', error);

    // Em caso de erro, retorne um status de erro e a mensagem
    // para que o frontend possa lidar com isso adequadamente
    event.node.res.statusCode = 400; // Bad Request
    return {
      error: 'Erro ao processar o pagamento',
      details: error.cause?.message || error.message,
    };
  }
});

import { defineEventHandler, readRawBody, readBody } from 'h3';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'node:crypto';

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const signatureHeader = event.node.req.headers['x-signature'] as string;
  const requestId = event.node.req.headers['x-request-id'] as string;
  const secret = runtimeConfig.mercadopagoWebhookSecret;

  // É crucial usar o corpo 'raw' (texto puro) para validar a assinatura
  const rawBody = await readRawBody(event); 

  if (!signatureHeader || !requestId || !rawBody || !secret) {
    console.error('Webhook: Cabeçalhos ou corpo da requisição ausentes.');
    event.node.res.statusCode = 400;
    return { error: 'Faltam informações para validar o webhook.' };
  }
  
  // 1. Validar a assinatura do Webhook para garantir a autenticidade
  const body = JSON.parse(rawBody || '{}');

  try {
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);
    
    const ts = parts.ts;
    const receivedSignature = parts.v1;
    const dataId = body.data?.id;

    if (!ts || !receivedSignature || !dataId) {
        console.error('Webhook: Informações de assinatura ou data.id ausentes.');
        event.node.res.statusCode = 400;
        return { error: 'Informações de assinatura ou data.id ausentes.' };
    }
    
    const manifest = `request-id:${requestId};ts:${ts};data-id:${dataId};`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== receivedSignature) {
      console.error('Webhook: Assinatura inválida.');
      event.node.res.statusCode = 403;
      return { error: 'Assinatura do webhook inválida.' };
    }
  } catch (e) {
    console.error('Webhook: Erro ao processar a assinatura.', e);
    event.node.res.statusCode = 400;
    return { error: 'Erro ao processar a assinatura.' };
  }

  // 2. A assinatura é válida, agora processamos a notificação.
  console.log('Webhook do Mercado Pago recebido e validado:', {
    action: body.action,
    type: body.type,
    data_id: body.data?.id,
  });

  if (body.type === 'payment') {
    const client = new MercadoPagoConfig({ accessToken: runtimeConfig.mercadopagoAccessToken });
    const payment = new Payment(client);

    try {
      // 3. Buscar os dados mais recentes do pagamento
      const paymentDetails = await payment.get({ id: body.data.id });
      console.log('Detalhes do pagamento recebidos via Webhook:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        status_detail: paymentDetails.status_detail,
      });

      //
      // AQUI: Lógica para atualizar seu banco de dados
      // Ex: findOrderAndUpdate(paymentDetails.external_reference, { status: paymentDetails.status });
      //
      
    } catch (error) {
      console.error('Webhook: Erro ao buscar detalhes do pagamento:', error);
    }
  }

  // 4. Retorne 200 OK para o Mercado Pago saber que você recebeu
  event.node.res.statusCode = 200;
  return { status: 'recebido' };
});

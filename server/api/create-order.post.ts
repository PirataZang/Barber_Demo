import { MercadoPagoConfig, Preference } from 'mercadopago'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const runtime = useRuntimeConfig()
    const body = await readBody(event)

    if (!body.payment_method) {
        throw createError({
            statusCode: 400,
            message: 'payment_method é obrigatório.',
        })
    }

    switch (body.payment_method) {
        // Mercado Pago
        case 'mercadoPago': {
            if (!runtime.mercadopagoAccessToken) {
                throw createError({
                    statusCode: 500,
                    message: 'Access Token do Mercado Pago não configurado.',
                })
            }

            const client = new MercadoPagoConfig({
                accessToken: runtime.mercadopagoAccessToken,
            })

            const preference = new Preference(client)

            const response = await preference.create({
                body: {
                    auto_return: 'approved',
                    back_urls: {
                        success: `${runtime.public.baseURL}/`,
                        failure: `${runtime.public.baseURL}/pagamento-falhou`,
                        pending: `${runtime.public.baseURL}/pagamento-pendente`,
                    },
                    notification_url: `${runtime.public.baseURL}/api/mercado-pago/webhook`,

                    items: [
                        {
                            id: body.product_name.toLowerCase().replace(/\s+/g, '_'), // ← Corrigido!
                            quantity: 1,
                            title: body.product_name,
                            unit_price: Number(body.price), // ← Garantir número!
                        },
                    ],
                },
            })

            return {
                url: runtime.env === 'production' ? response.init_point : response.sandbox_init_point,
            }
        }
    }

    throw createError({
        statusCode: 400,
        message: 'Método de pagamento inválido.',
    })
})

import crypto from 'crypto'
import MercadoPagoConfig, { Payment } from 'mercadopago'

export default defineEventHandler(async (event) => {
    const runtime = useRuntimeConfig()

    const body = await readBody(event)
    const signature = getHeader(event, 'x-signature')
    const reqID = getHeader(event, 'x-request-id')

    if (!body || !signature || !reqID) {
        setResponseStatus(event, 400)
        return { error: 'Missing Something :p' }
    }

    const ts = signature.split(',')[0].split('=')[1]
    const v1 = signature.split(',')[1].split('=')[1]

    const template = `id:${body.data.id};request-id:${reqID}:ts:${ts};`
    const cyphedSignature = crypto.createHmac('sha256', runtime.mercadopagoWebhookSecret).update(template).digest('hex')

    // Validate Payment
    if (cyphedSignature !== v1) {
        setResponseStatus(event, 400)
        return { error: 'Missing Something :p' }
    }

    const client = new MercadoPagoConfig({
        accessToken: runtime.mercadopagoAccessToken,
    })

    const payment = new Payment(client)

    const { status } = await payment.get({
        id: body.data.id,
    })

    if (status != 'approved') console.log('Num deu')

    setResponseStatus(event, 201)
    return true
})

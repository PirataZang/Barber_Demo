// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: false },
    modules: ['@nuxt/ui', '@nuxt/image'],
    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        mercadopagoWebhookSecret: process.env.NUXT_MERCADOPAGO_WEBHOOK_SECRET,
        mercadopagoAccessToken: process.env.NUXT_MERCADOPAGO_ACCESS_TOKEN,
        public: {
            baseURL: '',
            mercadopagoPublicKey: process.env.NUXT_PUBLIC_MERCADOPAGO_KEY,
        },
    },
    app: {
        head: {
            script: [
                // Certifique-se de que o SDK está carregado!
                { src: 'https://sdk.mercadopago.com/js/v2', async: true },
            ],
        },
    },
})

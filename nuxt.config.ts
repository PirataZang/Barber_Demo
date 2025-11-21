// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: false },
    modules: ['@nuxt/ui', '@nuxt/image'],
    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        mercadopagoWebhookSecret: '',
        mercadopagoAccessToken: 'APP_USR-3762980771464500-111714-90990d62a07a27146e9c552717715982-2988184892',
        public: {
            baseURL: '',
            // Exponha a chave pública para o frontend
            mpPublicKey: process.env.NUXT_PUBLIC_MERCADO_PAGO_KEY,
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

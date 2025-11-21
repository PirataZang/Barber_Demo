export const usePayment = async (price: number) => {
    const response = ref<any>(null)
    try {
        const mpPayment = await $fetch('/api/create-order', {
            method: 'POST',
            body: {
                product_name: 'NUXT teste',
                price: price,
                payment_method: 'mercadoPago',
            },
        })

        response.value = mpPayment // ← IMPORTANTE

        if (response.value.url) window.location.href = response.value.url
        else alert('nao deu')
    } catch (e: any) {
        console.error('Erro na chamada da API:', e)
        response.value = e?.data || null
    }
}

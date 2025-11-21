<template>
    <div class="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-xl mt-10">
        <h1 class="text-2xl font-bold mb-4 text-gray-800">Teste Rápido de Rota MP</h1>
        <p class="text-sm text-gray-600 mb-6">Testando se a rota <code>/api/create-order</code> responde corretamente.</p>

        <UButton @click="paymentTeste">
            <span v-if="loading">Enviando Body...</span>
            <span v-else>Gerar Pagamento</span>
        </UButton>

        <div v-if="response" class="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 class="text-lg font-semibold mb-2">Resposta da API:</h2>
            <pre class="whitespace-pre-wrap text-xs bg-white p-3 rounded overflow-x-auto border"
                >{{ response }}
            </pre>
        </div>

        <div v-if="error" class="mt-6 p-4 border border-red-500 bg-red-100 text-red-800 rounded-lg">
            <h2 class="text-lg font-semibold mb-2">Erro na Requisição:</h2>
            <p>{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const loading = ref(false)
const response = ref<any>(null)
const error = ref<any>(null)

const paymentTeste = usePayment(50)

const payment = async () => {
    loading.value = true
    response.value = null
    error.value = null

    try {
        const mpPayment = await $fetch('/api/create-order', {
            method: 'POST',
            body: {
                product_name: 'NUXT teste',
                price: 50.0,
                payment_method: 'mercadoPago',
            },
        })

        response.value = mpPayment // ← IMPORTANTE

        if (response.value.url) window.location.href = response.value.url
        else alert('nao deu')
    } catch (e: any) {
        console.error('Erro na chamada da API:', e)

        error.value = e?.data?.message || e?.message || 'Erro desconhecido'
        response.value = e?.data || null
    } finally {
        loading.value = false
    }
}
</script>

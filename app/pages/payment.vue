<template>
    <div class="p-4 md:p-8 max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-center">Teste de Pagamento</h1>

        <div class="space-y-4">
            <!-- Campo para inserir o valor -->
            <div>
                <label for="amount" class="block text-sm font-medium text-gray-700">Valor a Pagar (R$)</label>
                <UInput id="amount" v-model.number="paymentAmount" type="number" placeholder="10.50" size="xl" :disabled="isProcessing" />
            </div>

            <!-- Container do Brick de Pagamento -->
            <div id="paymentBrick_container" class="w-full"></div>

            <!-- Feedback -->
            <div v-if="paymentStatus" class="p-4 rounded-md text-center" :class="statusClass">
                <p class="font-semibold">{{ paymentStatus }}</p>
                <p v-if="paymentId">ID do Pagamento: {{ paymentId }}</p>
                <p v-if="statusDetail">{{ statusDetail }}</p>
            </div>

            <!-- Botão de Pagamento Externo -->
            <UButton @click="processPayment" block size="xl" :loading="isProcessing" :disabled="!isBrickReady || isProcessing">
                {{ isProcessing ? 'Processando...' : 'Pagar Agora' }}
            </UButton>
        </div>
    </div>
</template>

<script setup lang="ts">
// Declaração do objeto global do MercadoPago para o TypeScript
declare const MercadoPago: any

const runtimeConfig = useRuntimeConfig()
const isProcessing = ref(false)
const isBrickReady = ref(false)
const paymentAmount = ref(10.5) // Valor inicial de exemplo

// Estado para feedback ao usuário
const paymentStatus = ref('')
const statusDetail = ref('')
const paymentId = ref('')
const statusClass = computed(() => ({
    'bg-green-100 text-green-800': paymentStatus.value === 'Pagamento Aprovado',
    'bg-red-100 text-red-800': paymentStatus.value === 'Pagamento Recusado',
    'bg-yellow-100 text-yellow-800': paymentStatus.value === 'Erro',
}))

let bricks: any = null // Para manter a referência dos bricks
let brickController: any = null // Para manter o controller do brick

// 1. Lógica de submissão foi centralizada
async function submitPayment(cardFormData: any) {
    isProcessing.value = true
    paymentStatus.value = ''

    try {
        const response = await $fetch('/api/mercado-pago/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-idempotency-key': crypto.randomUUID(),
            },
            body: {
                ...cardFormData,
                transaction_amount: paymentAmount.value,
                description: 'Produto de Teste - Barber Demo',
                payer: cardFormData.payer,
            },
        })
        handlePaymentResponse(response)
    } catch (error: any) {
        console.error('Erro ao chamar o backend:', error)
        paymentStatus.value = 'Erro'
        statusDetail.value = error.data?.details || 'Não foi possível conectar com o servidor de pagamento.'
        isProcessing.value = false
    }
}

// 2. Botão externo aciona esta função
async function processPayment() {
    if (!brickController) return

    try {
        const cardFormData = await brickController.getFormData()
        await submitPayment(cardFormData)
    } catch (error) {
        console.error('Erro de validação do Brick:', error)
        paymentStatus.value = 'Erro'
        statusDetail.value = 'Por favor, verifique os dados do cartão.'
    }
}

async function renderBrick() {
    if (brickController) {
        await brickController.unmount()
    }

    const container = document.getElementById('paymentBrick_container')
    if (container) container.innerHTML = ''

    const mp = new MercadoPago(runtimeConfig.public.mercadopagoPublicKey)
    bricks = mp.bricks()

    const settings = {
        initialization: {
            amount: paymentAmount.value,
        },
        customization: {
            visual: {
                style: { theme: 'default' },
                hidePaymentButton: true, // 3. Esconde o botão de pagamento do Brick
            },
            paymentMethods: {
                creditCard: 'all',
                debitCard: 'all',
                pix: 'all',
                maxInstallments: 1,
            },
        },
        callbacks: {
            onReady: () => {
                isBrickReady.value = true
                console.log('Payment Brick está pronto!')
            },
            // onSubmit é chamado se o usuário pressionar Enter, por exemplo.
            onSubmit: async (cardFormData: any) => {
                await submitPayment(cardFormData)
            },
            onError: (error: any) => {
                console.error('Erro no Payment Brick:', error)
                paymentStatus.value = 'Erro'
                statusDetail.value = 'Houve um problema ao validar os dados do pagamento.'
                isProcessing.value = false
            },
        },
    }

    try {
        brickController = await bricks.create('payment', 'paymentBrick_container', settings)
    } catch (error) {
        console.error('Falha ao renderizar o Mercado Pago Brick:', error)
        paymentStatus.value = 'Erro'
        statusDetail.value = 'Não foi possível carregar o formulário de pagamento.'
    }
}

function handlePaymentResponse(response: any) {
    paymentId.value = response.id
    statusDetail.value = response.status_detail

    if (response.status === 'approved') {
        paymentStatus.value = 'Pagamento Aprovado'
    } else {
        paymentStatus.value = 'Pagamento Recusado'
    }
    isProcessing.value = false
}

watch(paymentAmount, () => {
    if (typeof MercadoPago !== 'undefined' && runtimeConfig.public.mercadopagoPublicKey) {
        renderBrick()
    }
})

onMounted(() => {
    const checkMpReady = setInterval(() => {
        if (typeof MercadoPago !== 'undefined' && runtimeConfig.public.mercadopagoPublicKey) {
            clearInterval(checkMpReady)
            renderBrick()
        }
    }, 200)
})

onBeforeUnmount(async () => {
    if (brickController) {
        await brickController.unmount()
        console.log('Payment Brick desmontado.')
    }
})
</script>

<style>
/* Estilos para o container do brick, se necessário */
#paymentBrick_container {
    min-height: 400px;
}
</style>

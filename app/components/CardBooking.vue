<template>
    <UCard class="w-full shadow-xl p-0 hover:border-indigo-400 transition-all duration-300">
        <div class="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalhes do Agendamento</h3>
            <UBadge color="indigo" variant="subtle">Ativo</UBadge>
        </div>

        <div class="p-4 space-y-3">
            <div class="flex justify-between items-start">
                <div class="flex flex-col">
                    <span class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        {{ bookingLocal.service?.name ?? '— Serviço não disponível —' }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400"> Duração: {{ bookingLocal.service?.duration ?? '—' }} Minutos </span>
                </div>
                <span class="text-2xl font-extrabold text-gray-900 dark:text-white"> R$ {{ formattedPrice }} </span>
            </div>

            <div class="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-calendar-days-20-solid" class="w-5 h-5 text-indigo-500" />
                    <span>Data: {{ formattedDate }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-clock-20-solid" class="w-5 h-5 text-indigo-500" />
                    <span>Hora: {{ formattedTime }}</span>
                </div>
            </div>
        </div>

        <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <span class="text-sm text-gray-400 dark:text-gray-600"> Ações em breve... </span>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
// Removida a importação 'swal' e 'toast'

// Assumindo tipos do Prisma
import type { Service, Checkin } from '@prisma/client'

// Define a estrutura esperada do agendamento, incluindo o serviço
interface BookingWithService extends Checkin {
    service: Pick<Service, 'name' | 'price' | 'duration'>
}

const props = defineProps<{
    booking: Partial<BookingWithService> & { id: string }
    // Removida a prop 'onCancel'
}>()

// bookingLocal reativo para carregar info do service
const bookingLocal = ref<Partial<BookingWithService> & { id: string }>(props.booking as any)

// Removida a ref 'isCancelling'

// --------------------------------------------------------
// Lógica de Enriquecimento de Dados (Mantida)
// --------------------------------------------------------
onMounted(async () => {
    try {
        // Se o objeto booking veio incompleto, tenta buscar a informação de serviço
        if (!bookingLocal.value.service && bookingLocal.value.date && bookingLocal.value.userId) {
            const dateStr = new Date(bookingLocal.value.date as any).toISOString()

            // ATENÇÃO: Se o seu backend não aceita GET com body, mude para query params
            const { data, error } = await useFetch('/api/checkin?date=' + encodeURIComponent(dateStr), {
                method: 'GET',
                body: { userId: bookingLocal.value.userId },
            })

            if (!error.value && data.value && Array.isArray(data.value)) {
                const found = (data.value as any[]).find((b) => b.id === bookingLocal.value.id)
                if (found) {
                    bookingLocal.value = { ...(bookingLocal.value as any), ...found }
                }
            }
        }
    } catch (e) {
        // Silencioso. A exibição usará os fallbacks (— Serviço —)
    }
})

// --------------------------------------------------------
// Formatação de Dados (Mantida)
// --------------------------------------------------------
const formattedPrice = computed(() => {
    // Busca o preço, priorizando a informação enriquecida local
    const price = Number(bookingLocal.value.service?.price ?? props.booking.service?.price ?? 0) || 0
    return price.toFixed(2).replace('.', ',')
})

const formattedDate = computed(() => {
    // Busca a data, priorizando a informação enriquecida local
    const date = new Date(bookingLocal.value.date ?? props.booking.date)
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
})

const formattedTime = computed(() => {
    // Busca a hora, priorizando a informação enriquecida local
    const date = new Date(bookingLocal.value.date ?? props.booking.date)
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    })
})

// --------------------------------------------------------
// Lógica de Cancelamento (REMOVIDA)
// --------------------------------------------------------
// As funções confirmCancel e handleCancel foram removidas.
</script>

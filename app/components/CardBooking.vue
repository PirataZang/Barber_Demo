<template>
    <UCard :class="['w-full shadow-xl p-0 transition-all duration-300', bookingLocal.canceled ? 'opacity-70 bg-gray-50 dark:bg-gray-900' : 'hover:border-indigo-400']">
        <div class="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalhes do Agendamento</h3>
            <UBadge :color="bookingLocal.canceled ? 'error' : 'primary'" variant="subtle">{{ bookingLocal.canceled ? 'Cancelado' : 'Ativo' }}</UBadge>
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

            <div class="grid grid-cols-1 gap-2 text-gray-700 dark:text-gray-300">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-calendar-days-20-solid" class="w-5 h-5 text-indigo-500" />
                    <div class="flex flex-col">
                        <span class="text-sm">Data</span>
                        <span class="font-medium">{{ formattedDate }}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-clock-20-solid" class="w-5 h-5 text-indigo-500" />
                    <div class="flex flex-col">
                        <span class="text-sm">Hora</span>
                        <span class="font-medium">{{ formattedTime }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-4 border-t border-gray-100 dark:border-gray-800">
            <div class="flex justify-between items-center w-full">
                <div>
                    <UButton v-if="!bookingLocal.canceled" icon="i-heroicons-trash-20-solid" color="error" variant="outline" :loading="isCancelling" @click="cancelBooking">Cancelar</UButton>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { BarberService, Checkin } from '@prisma/client'
interface BookingWithService extends Checkin {
    service: Pick<BarberService, 'name' | 'price' | 'duration'>
}

const props = defineProps<{
    booking: Partial<BookingWithService> & { id: string }
}>()

const bookingLocal = ref<Partial<BookingWithService> & { id: string }>(props.booking as any)

onMounted(async () => {
    try {
        if (!bookingLocal.value.service && bookingLocal.value.date && bookingLocal.value.userId) {
            const dateStr = new Date(bookingLocal.value.date as any).toISOString()

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
    } catch (e) {}
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
    const raw = bookingLocal.value.date ?? props.booking.date
    const date = raw ? new Date(raw as any) : new Date()
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
})

const formattedTime = computed(() => {
    // Busca a hora, priorizando a informação enriquecida local
    const raw = bookingLocal.value.date ?? props.booking.date
    const date = raw ? new Date(raw as any) : new Date()
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    })
})

// --------------------------------------------------------
// Lógica de Cancelamento
// --------------------------------------------------------
const emit = defineEmits(['onCancel'])
const isCancelling = ref(false)

async function cancelBooking() {
    if (!bookingLocal.value.id) return
    isCancelling.value = true
    try {
        const { error } = await useFetch('/api/checkin/checkin-cancel', {
            method: 'POST',
            body: { id: bookingLocal.value.id },
        })
        if (error.value) {
            // opcional: mostrar toast de erro
            isCancelling.value = false
            return
        }
        emit('onCancel', bookingLocal.value.id)
    } catch (e) {
        // opcional: mostrar toast de erro
    } finally {
        isCancelling.value = false
    }
}

const isCanceled = computed(() => Boolean(bookingLocal.value?.canceled))
</script>

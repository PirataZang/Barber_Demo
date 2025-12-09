<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Todos os Agendamentos</h1>

        <div class="flex flex-col gap-5 justify-between mb-4">
            <div class="flex justify-between">
                <div class="text-black flex flex-col gap-1">
                    <label for="dateStart" class="text-sm">Data Inicial</label>
                    <input ref="dateStart" class="text-white bg-gray-800 text-sm p-2 rounded-md" type="date" v-model="form.dateStart" @click="showCalendar = true" />
                </div>
                <div class="text-black flex flex-col gap-1">
                    <label for="dateEnd" class="text-sm">Data Final</label>
                    <input ref="dateEnd" class="text-white bg-gray-800 text-sm p-2 rounded-md" type="date" v-model="form.dateEnd" @click="showCalendar = true" />
                </div>
            </div>
            <UButton size="sm" class="w-fit" color="primary" :loading="isLoading" @click="manualRefresh"> Atualizar</UButton>
        </div>

        <div v-if="isLoading" class="space-y-4">
            <USkeleton v-for="n in 3" :key="n" class="h-28 w-full rounded-xl" />
        </div>

        <ClientOnly>
            <div v-if="bookings.length > 0" class="space-y-4">
                <BarberBookingCard v-for="booking in bookings" :key="booking.id" :booking="booking" @onCancel="handleBookingCancel" />
            </div>

            <div v-else class="text-gray-500">Nenhum agendamento encontrado.</div>

            <template #fallback>
                <div class="text-gray-400">Carregando agendamentos (Apenas Cliente)...</div>
            </template>
        </ClientOnly>
    </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

import { ref, computed, watch } from 'vue'

const showCalendar = ref(false)

const formatToYYYYMMDD = (date: Date): string => {
    return date.toISOString().substring(0, 10)
}

const addDaysToDate = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const today = new Date()
const dateStartFormatted = formatToYYYYMMDD(today)

const futureDate = addDaysToDate(today, 7)
const dateEndFormatted = formatToYYYYMMDD(futureDate)

const isLoading = ref(false)

interface Form {
    dateStart: any
    dateEnd: any
}

const form = reactive<Form>({
    dateStart: dateStartFormatted,
    dateEnd: dateEndFormatted,
})

const reload = async () => {
    isLoading.value = true
    const { data: bookingsData, error } = await useFetch(`/api/checkin/checkin?dateStart="${encodeURIComponent(form.dateStart)}"&dateEnd="${encodeURIComponent(form.dateEnd)}"`, {
        method: 'POST',
        body: { includeCanceled: false },
        default: () => [],
        server: true,
    })

    // Log errors if any
    if (error.value) {
        console.error('Error fetching bookings:', error.value)
    }

    isLoading.value = false

    return (bookings.value = bookingsData.value)
}

// Reactive bookings list
const bookings = ref<any[]>([])
function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}

onMounted(() => {
    reload()
})

async function manualRefresh() {
    try {
        reload()
    } catch (err) {
        console.error('Refresh error:', err)
    }
}
</script>

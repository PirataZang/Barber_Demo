<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Todos os Agendamentos</h1>

        <div class="flex items-center justify-between mb-4">
            <div />
            <UButton size="sm" color="primary" :loading="pending" @click="manualRefresh">Atualizar</UButton>
        </div>

        <div v-if="pending" class="space-y-4">
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

import collect from 'collect.js'
import { ref, computed, watch } from 'vue'

const todayIso = new Date().toISOString()
const {
    data: bookingsData,
    pending,
    refresh,
    error,
} = await useFetch(`/api/checkin/checkin?date=${encodeURIComponent(todayIso)}`, {
    method: 'POST',
    body: { includeCanceled: false },
    default: () => [],
    server: true,
})

// Reactive bookings list
const bookings = ref<any[]>([])
function applyBookingFilter(data: any[] | undefined) {
    if (!data) {
        bookings.value = []
        return
    }

    const bookingFiltered = collect(data as any[])
        .filter((booking: any) => {
            let bookingDate = new Date(booking.date)
            bookingDate.setHours(bookingDate.getHours() + 3)
            const currentDate = new Date()
            currentDate.setHours(currentDate.getHours() - 1)

            return bookingDate >= currentDate
        })
        .all()

    bookings.value = bookingFiltered
}

watch(
    bookingsData,
    (newBookingsData) => {
        applyBookingFilter(newBookingsData)
    },
    {
        // Garante que o watcher rode imediatamente para popular bookings com o dado SSR
        immediate: true,
    }
)

function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}

async function manualRefresh() {
    try {
        await refresh()
        applyBookingFilter(bookingsData.value)
    } catch (err) {
        console.error('Refresh error:', err)
    }
}

// Log errors if any
if (error.value) {
    console.error('Error fetching bookings:', error.value)
}
</script>

<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Todos os Agendamentos</h1>

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
definePageMeta({ layout: 'default' })

import collect from 'collect.js'
import { ref, computed, watch } from 'vue'
import { authClient } from '~/lib/auth-client'

const todayIso = new Date().toISOString()
const {
    data: bookingsData,
    pending,
    error,
} = await useFetch(`/api/checkin/checkin?date=${encodeURIComponent(todayIso)}`, {
    method: 'POST',
    body: {},
    default: () => [],
    server: true,
})

// Reactive bookings list
const bookings = ref<any[]>([])
watch(
    bookingsData,
    (newBookingsData) => {
        if (newBookingsData) {
            // Você pode aplicar sua lógica de filtragem (hora atual - 1h) aqui se precisar!
            // Caso contrário, atribua o valor diretamente.
            const bookingFiltered = collect(newBookingsData)
                .filter((booking) => {
                    let bookingDate = new Date(booking.date)
                    bookingDate.setHours(bookingDate.getHours() + 3)
                    const currentDate = new Date()
                    currentDate.setHours(currentDate.getHours() - 1)

                    if (bookingDate >= currentDate) return booking
                })
                .all()
            bookings.value = bookingFiltered
        }
    },
    {
        // Garante que o watcher rode imediatamente para popular bookings com o dado SSR
        immediate: true,
    }
)

function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}

// Log errors if any
if (error.value) {
    console.error('Error fetching bookings:', error.value)
}
</script>

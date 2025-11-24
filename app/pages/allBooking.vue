<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Todos os Agendamentos</h1>

        <div v-if="pending" class="space-y-4">
            <USkeleton v-for="n in 3" :key="n" class="h-28 w-full rounded-xl" />
        </div>

        <div v-else-if="bookings.length > 0" class="space-y-4">
            <CardBooking v-for="booking in bookings" :key="booking.id" :booking="booking" @onCancel="handleBookingCancel" />
        </div>

        <div v-else class="text-gray-500">Nenhum agendamento encontrado.</div>
    </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { ref, computed } from 'vue'
import { authClient } from '~/lib/auth-client'

// Fetch session from authClient
const { data: session } = await authClient.useSession(useFetch)

// Fetch all bookings using useFetch with SSR
const { data: bookingsData, pending, error } = await useFetch('/api/checkin/checkin', {
    method: 'POST',
    body: {}, // Empty body = fetch all bookings
    default: () => [],
})

// Reactive bookings list
const bookings = ref(bookingsData.value ?? [])

// Watch for data changes
watch(() => bookingsData.value, (newData) => {
    if (newData) {
        bookings.value = newData
    }
}, { immediate: true })

function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}

// Log errors if any
if (error.value) {
    console.error('Error fetching bookings:', error.value)
}
</script>

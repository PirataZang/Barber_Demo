<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Meus Agendamentos</h1>

        <ClientOnly>
            <div v-if="loading" class="space-y-4">
                <USkeleton v-for="n in 3" :key="n" class="h-28 w-full rounded-xl" />
            </div>

            <div v-else class="space-y-4">
                <CardBooking v-for="booking in bookings" :key="booking.id" :booking="booking" @onCancel="handleBookingCancel" />
                <div v-if="!bookings.length" class="text-gray-500">Nenhum agendamento encontrado.</div>
            </div>
        </ClientOnly>
    </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { ref, onMounted } from 'vue'
import { authClient } from '~/lib/auth-client'

const { data: session } = await authClient.useSession(useFetch)

const userId = session.value?.user?.id
const bookings = ref<any[]>([])
const loading = ref(false)
const error = ref(null)

async function fetchBookings() {
    if (!userId) {
        bookings.value = []
        return
    }

    loading.value = true
    try {
        const { data: result, error: fetchError } = await useFetch('/api/checkin/checkin', {
            method: 'POST',
            body: { userId },
        })

        if (fetchError.value) {
            console.error('Error fetching bookings:', fetchError.value)
            error.value = fetchError.value
        } else {
            bookings.value = result.value ?? []
        }
    } catch (err) {
        console.error('Error:', err)
        error.value = err
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchBookings()
})

function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}
</script>

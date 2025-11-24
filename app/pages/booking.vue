<template>
    <UContainer class="py-8 space-y-6">
        <h1 class="text-3xl font-bold">Meus Agendamentos</h1>

        <ClientOnly>
                <div class="flex items-center justify-between mb-4">
                    <div />
                    <UButton size="sm" color="primary" :loading="pending" @click="manualRefresh">Atualizar</UButton>
                </div>

                <div v-if="pending" class="space-y-4">
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

import { ref, watch } from 'vue'
import { authClient } from '~/lib/auth-client'

const { data: session } = await authClient.useSession(useFetch)

const userId = session.value?.user?.id
const bookings = ref<any[]>([])
const error = ref(null)

// Use server-side fetch to prevent client re-fetch overwriting SSR content on F5
const { data: bookingsData, pending, refresh, error: fetchError } = await useFetch(
    '/api/checkin/checkin',
    {
        method: 'POST',
        body: { userId, includeCanceled: true },
        default: () => [],
        server: true,
    }
)

// Initialize bookings from SSR payload and keep in sync after manual refresh
watch(
    bookingsData,
    (val) => {
        bookings.value = val ?? []
    },
    { immediate: true }
)

async function manualRefresh() {
    try {
        await refresh()
        bookings.value = bookingsData.value ?? []
    } catch (err) {
        console.error('Refresh error:', err)
    }
}

function handleBookingCancel(id: string) {
    bookings.value = bookings.value.filter((b) => b.id !== id)
}
</script>

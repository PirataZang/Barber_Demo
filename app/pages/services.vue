<template>
    <UContainer class="py-8 space-y-8">
        <div class="text-center pt-4">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-400">Nossos Serviços</h1>
            <p class="text-lg text-gray-600 dark:text-gray-400 mt-2">Escolha seu próximo corte ou tratamento e agende agora.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <template v-if="loading">
                <USkeleton v-for="n in 6" :key="n" class="h-[280px] w-full rounded-xl" />
            </template>

            <template v-else>
                <CardBarber v-for="barber in barberservices || []" :key="barber.id" :id="barber.id" :name="barber.name" :image="barber.image" :description="barber.description" :price="barber.price" :hour="barber.duration" />
            </template>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
// Seu script setup permanece o mesmo
definePageMeta({
    layout: 'default',
})

const {
    data: barberservices,
    pending: loading,
    error,
} = await useFetch('/api/barberservices/barberservices-list', {
    default: () => [],
    lazy: true,
})

if (error.value) {
    console.error('Error fetching barber services:', error.value)
}
</script>

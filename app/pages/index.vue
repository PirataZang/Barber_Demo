<template>
    <div class="space-y-2 p-2">
        <div class="flex gap-2 flex-wrap">
            <template v-if="loading">
                <USkeleton v-for="n in 4" :key="n" class="h-[230px] w-[400px] rounded-xl" />
            </template>

            <template v-else>
                <CardBarber v-for="barber in barberservices || []" :key="barber.id" :name="barber.name" :image="barber.image" :description="barber.description" :price="barber.price" :hour="barber.duration" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

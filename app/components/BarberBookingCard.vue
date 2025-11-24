<template>
  <UCard class="w-full shadow-md p-0">
    <div class="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Agendado</h3>
    </div>

    <div class="p-4 space-y-3">
      <div class="flex justify-between items-start">
        <div class="flex flex-col">
          <span class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {{ booking.service?.name ?? '— Serviço —' }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Duração: {{ booking.service?.duration ?? '—' }} minutos
          </span>
        </div>
        <span class="text-2xl font-extrabold text-gray-900 dark:text-white">
          R$ {{ formattedPrice }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-1 text-gray-700 dark:text-gray-300">
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
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Service, Checkin, User } from '@prisma/client'

interface BookingWithServiceAndUser extends Checkin {
  service?: Partial<Pick<Service, 'name' | 'price' | 'duration' | 'description'>>
  user?: Partial<Pick<User, 'id' | 'name' | 'email'>>
}

const props = defineProps<{
  booking: BookingWithServiceAndUser
}>()

const formattedPrice = computed(() => {
  const price = Number(props.booking.service?.price ?? 0) || 0
  return price.toFixed(2).replace('.', ',')
})

const formattedDate = computed(() => {
  const date = new Date(props.booking.date)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const formattedTime = computed(() => {
  const date = new Date(props.booking.date)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
})
</script>

<style scoped>
/* minimal styling kept to utility classes in template */
</style>

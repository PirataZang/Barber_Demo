<template>
    <UCard class="w-full h-full p-0 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="relative">
            <div class="h-48 overflow-hidden">
                <img :src="image" :alt="'Imagem do serviço: ' + name" class="object-cover w-full h-full transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>

            <div class="p-4 space-y-2">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ description }}</p>
            </div>

            <div class="p-4 pt-0 flex justify-between items-end border-t border-gray-100 dark:border-gray-800">
                <div class="flex flex-col space-y-1">
                    <span class="text-2xl font-extrabold text-amber-600">R$ {{ formattedPrice }}</span>
                    <div class="text-xs text-gray-500 flex items-center gap-1">
                        <UIcon name="i-heroicons-clock-20-solid" class="w-4 h-4" />
                        Duração: {{ hour }} Minutos
                    </div>
                </div>

                <ClientOnly>
                    <UButton v-if="!session?.user?.id" @click="login" color="amber" label="Login" icon="i-heroicons-arrow-right-start-on-rectangle-20-solid" />

                    <CheckinModal v-else :userId="session.user.id" :time="props.hour" :serviceId="props.id" label="Agendar" />

                    <template #fallback>
                        <div class="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                    </template>
                </ClientOnly>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { authClient } from '~/lib/auth-client'
// Importe CheckinModal se ele for um componente do Nuxt UI ou seu
// Se CheckinModal for apenas um botão que abre um modal, certifique-se de que ele tenha uma prop 'label'

interface Props {
    id: string
    name: string
    image: string
    description: string
    price: number
    hour: number
}

// O await continua sendo necessário para a busca inicial
const { data: session } = await authClient.useSession(useFetch)

const login = () => {
    // Redireciona para o login social
    authClient.signIn.social({
        provider: 'google',
    })
}

const props = defineProps<Props>()

// Função para formatar o preço para moeda brasileira
const formattedPrice = computed(() => {
    // Garantindo que price seja tratado como number antes de toFixed
    return (Number(props.price) || 0).toFixed(2).replace('.', ',')
})
</script>

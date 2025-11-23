<template>
    <div class="flex h-[230px] w-[400px] rounded-2xl border border-gray-300">
        <div class="relative w-full">
            <img :src="image" class="object-cover w-full h-full rounded-2xl" alt="imagem" />

            <div class="absolute text-white bottom-0 left-0 right-0 p-4 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent">
                <h3 class="text-lg font-semibold">{{ name }}</h3>
                <p class="text-sm">{{ description }}</p>
                <div class="mt-2 flex flex-col">
                    <span class="text-md font-bold">R$ {{ price }}</span>
                    <span class="text-sm">Duração: {{ hour }} Minutos</span>
                </div>
            </div>

            <div class="absolute bottom-5 right-5">
                <UButton v-if="!session?.user.id" @click="login" color="neutral">Login</UButton>
                <CheckinModal v-if="session?.user.id" :userId="session.user.id" :time="props.hour" :serviceId="props.id"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Não há mudanças aqui
interface Props {
    id: string
    name: string
    image: any
    description: any
    price: any
    hour: any
}

const { data: session } = await authClient.useSession(useFetch)

const login = () => {
    authClient.signIn.social({
        provider: 'google',
    })
}

const props = defineProps<Props>()
</script>

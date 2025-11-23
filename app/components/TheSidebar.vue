<template>
    <div>
        <Transition name="fade">
            <div v-if="isOpen" @click="$emit('closeSidebar')" class="absolute inset-0 bg-black opacity-85 z-40"></div>
        </Transition>

        <Transition name="slide">
            <div v-if="isOpen" class="fixed flex flex-col justify-between top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform">
                <div>
                    <div class="p-6 bg-gray-900 flex flex-col gap-5">
                        <div class="flex justify-between gap-4 items-center">
                            <UButton v-if="!session?.user.id" @click="login" color="success">Login</UButton>
                            <UUser
                                v-if="session?.user.id"
                                :name="session?.user.name"
                                :description="session?.user.email"
                                :avatar="{
                                src: session?.user.image as string,
                            }"
                            />
                            <button @click="$emit('closeSidebar')" class="text-gray-500 hover:text-indigo-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="flex gap-2">
                            <UButton v-if="session?.user.id" @click="logout" class="w-[70px]" color="error">Logout</UButton>
                            <UserForm v-if="session?.user.id" :id="session?.user.id" colorButton="secondary" />
                        </div>
                    </div>

                    <div ref="nav">
                        <nav class="space-y-3">
                            <NuxtLink to="/" class="flex items-center p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition duration-200">dashboard</NuxtLink>
                            <NuxtLink v-if="session?.user.id" to="/booking" class="flex items-center p-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition duration-200">Agendamentos</NuxtLink>
                        </nav>
                    </div>
                </div>
                <div ref="footer" class="p-1">
                    <NuxtImg src="/logo.jpg" class="object-cover rounded" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

// Props: controla o estado de aberto/fechado
defineProps<{
    isOpen: boolean
}>()

const login = () => {
    authClient.signIn.social({
        provider: 'google',
    })
}

const logout = () => {
    authClient.signOut()
}

const { data: session } = await authClient.useSession(useFetch)

// Emits: informa ao pai para fechar
defineEmits(['closeSidebar'])
</script>

<style scoped>
/* Transição Slide (Entrada/Saída) */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease-in-out;
}
/* Posição inicial/final (fora da tela) */
.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}

/* Transição Fade (Fundo Escuro) */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

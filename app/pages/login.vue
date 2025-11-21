<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
    layout: 'clean',
})

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const response = await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: email.value,
                password: password.value,
            },
        })

        successMessage.value = response.message || 'Login bem-sucedido!'
        // Redirecionar para uma página protegida após o login
        await navigateTo('/')
    } catch (error: any) {
        console.error('Erro de login:', error)
        errorMessage.value = error?.response?._data?.message || error?.data?.message || 'Falha ao fazer login. Verifique suas credenciais.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-6">Login</h1>
        <form @submit.prevent="handleLogin" class="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm flex flex-col gap-6">
            <div class="flex flex-col">
                <label for="email" class="mb-2 text-sm font-semibold text-gray-700">E-mail:</label>
                <input type="email" id="email" v-model="email" required :disabled="loading" class="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 disabled:bg-gray-50 disabled:cursor-not-allowed" />
            </div>

            <div class="flex flex-col">
                <label for="password" class="mb-2 text-sm font-semibold text-gray-700">Senha:</label>
                <input type="password" id="password" v-model="password" required :disabled="loading" class="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 disabled:bg-gray-50 disabled:cursor-not-allowed" />
            </div>

            <button type="submit" :disabled="loading" class="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-300">
                <span v-if="loading">Entrando...</span>
                <span v-else>Entrar</span>
            </button>

            <p v-if="errorMessage" class="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-center font-medium transition duration-300 ease-in-out animate-pulse">
                {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="text-green-700 bg-green-100 border border-green-300 p-3 rounded-lg text-center font-medium transition duration-300 ease-in-out">
                {{ successMessage }}
            </p>
        </form>
    </div>
</template>

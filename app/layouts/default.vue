<template>
    <div class="flex flex-col min-h-screen">
        <TheHeader @toggleSidebar="showSidebar = true" />

        <div class="flex flex-1">
            <TheSidebar :isOpen="showSidebar" @closeSidebar="showSidebar = false" />

            <main class="flex-1 bg-gray-50 md:ml-0">
                <slot />
            </main>
        </div>
        
        <TheFooter />
    </div>
</template>

<script setup>
import { ref } from 'vue' // <-- IMPORTANTE: Importar ref

const showSidebar = ref(false) // <-- CORREÇÃO 1: Usar ref()
</script>

<template>
    <header class="bg-white w-full shadow-md sticky top-0 z-40">
        <div class="container w-full px-2 py-1 flex justify-between">
            <div @click="$emit('toggleSidebar')" class="flex items-center cursor-pointer">
                <span class="rounded-full overflow-hidden flex items-center justify-center h-[55px] w-[55px]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </span>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
// Define os emits que o componente pai irá escutar (para abrir o menu)
defineEmits(['toggleSidebar'])
</script>

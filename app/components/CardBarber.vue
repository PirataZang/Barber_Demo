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
                <u-button color="neutral">Agendar</u-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Não há mudanças aqui
interface Props {
    name: string
    image: any
    description: any
    price: any
    hour: any
}

const props = defineProps<Props>()
</script>

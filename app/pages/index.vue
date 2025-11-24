<template>
    <div>
        <div class="relative h-[60vh] md:h-[80vh] overflow-hidden bg-gray-900">
            <UContainer class="relative flex items-center justify-center h-full text-center" style="z-index: 10">
                <div class="text-white space-y-4 md:space-y-6 max-w-3xl p-4">
                    <UBadge color="indigo" variant="subtle" size="md" class="tracking-widest uppercase"> ESTÚDIO DE BELEZA </UBadge>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-snug">Seu Estilo, Nossa Especialidade.</h1>

                    <p class="text-base sm:text-lg text-gray-300">O melhor em estética e cuidado pessoal para cabelo, corpo e unhas.</p>

                    <div class="pt-4">
                        <UButton icon="i-heroicons-calendar-days-20-solid" size="xl" color="indigo" variant="solid" label="Agendar Agora" to="/services" :padded="true" class="shadow-xl hover:shadow-indigo-500/50 transition-shadow duration-300" />
                    </div>
                </div>
            </UContainer>
        </div>

        <UContainer class="py-16 md:py-24">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <UCard class="hover:shadow-lg transition-shadow duration-300">
                    <div class="space-y-4">
                        <UIcon name="i-heroicons-sparkles-20-solid" class="w-10 h-10 text-indigo-500 mx-auto" />
                        <h3 class="font-semibold text-lg">Especialistas Certificados</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Nossa equipe é especializada em todas as técnicas de estética e tratamento capilar.</p>
                    </div>
                </UCard>

                <UCard class="hover:shadow-lg transition-shadow duration-300">
                    <div class="space-y-4">
                        <UIcon name="i-heroicons-heart-20-solid" class="w-10 h-10 text-indigo-500 mx-auto" />
                        <h3 class="font-semibold text-lg">Ambiente Premium</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Relaxe e desfrute de uma experiência de cuidado e bem-estar em nosso espaço.</p>
                    </div>
                </UCard>

                <UCard class="hover:shadow-lg transition-shadow duration-300">
                    <div class="space-y-4">
                        <UIcon name="i-heroicons-clock-20-solid" class="w-10 h-10 text-indigo-500 mx-auto" />
                        <h3 class="font-semibold text-lg">Agendamento Flexível</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Reserve seu horário em segundos pelo site ou aplicativo.</p>
                    </div>
                </UCard>
            </div>
        </UContainer>
    </div>
</template>

<script setup lang="ts">
// ...
</script>

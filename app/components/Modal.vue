<template>
    <div>
        <UButton :label="label" :color="buttonColor" :variant="buttonVariant" :class="`w-[${buttonSize}]`" @click="openModal" />

        <Transition enter-active-class="ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true" @click.self="closeOnOutsideClick && closeModal()">
                <Transition enter-active-class="ease-out duration-300 transform" enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="ease-in duration-200 transform" leave-from-class="opacity-100 translate-y-0 sm:scale-100" leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                    <div v-if="isOpen" :class="['fixed inset-0 overflow-y-auto flex items-center justify-center p-4', customWrapperClass]">
                        <div
                            :class="[
                                'rounded-xl shadow-2xl transition-all',
                                backgroundColor, // Fundo customizado
                                `w-[${modalWidth}]`, // 💡 APLICAÇÃO DA LARGURA AQUI
                                panelClass, // 💡 CLASSE EXTRA
                            ]"
                        >
                            <div class="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                                <h3 class="text-xl font-bold text-white">
                                    {{ modalTitle }}
                                </h3>
                                <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="hover:bg-gray-700" @click="closeModal" />
                            </div>

                            <div class="p-4">
                                <slot />
                            </div>

                            <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-700/50">
                                <div class="flex justify-end gap-2">
                                    <slot name="footer" :close="closeModal" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
// ---- Estado ----
const isOpen = ref(false)

// ---- Emits ----
const emit = defineEmits(['open', 'close'])

// ---- Funções de Controle ----
function openModal() {
    isOpen.value = true
    emit('open')
}

function closeModal() {
    isOpen.value = false
    emit('close')
}

// ---- Props ----
interface Props {
    // Props para o Botão
    label?: string
    buttonSize?: string
    buttonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gray'
    buttonVariant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link' | 'subtle'

    // Props para o Modal
    modalTitle?: string
    backgroundColor?: string
    modalWidth?: string // 💡 NOVA PROP: Para largura do modal (ex: 'max-w-xl', 'w-[600px]')
    panelClass?: string // 💡 customClass RENOMEADO: Classe extra para o painel
    customWrapperClass?: string // Classe customizada para o container do painel
    closeOnOutsideClick?: boolean // Fechar ao clicar fora
}

const props = withDefaults(defineProps<Props>(), {
    // Padrões do Botão
    label: 'Abrir Modal',
    buttonSize: 'fit',
    buttonColor: 'neutral',
    buttonVariant: 'subtle',

    // Padrões do Modal
    modalTitle: 'Janela Personalizada',
    backgroundColor: 'bg-gray-800', // Padrão: Cinza Escuro (chumbo)
    modalWidth: 'max-w-lg', // 💡 Padrão de Largura
    panelClass: '',
    customWrapperClass: '',
    closeOnOutsideClick: true,
})
</script>

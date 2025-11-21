<template>
    <UModal :class="[`w-[${props?.buttonSize}]`]" title="Configurações do Usuário" description="Configurações relacionadas ao usuário">
        <UButton label="Configurações do Usuário" color="neutral" variant="subtle" />

        <template #body class=""> </template>
    </UModal>
</template>

<script setup lang="ts">
interface Props {
    buttonSize?: string
}

// defineProps com tipagem + withDefaults para valores padrão
const props = withDefaults(defineProps<Props>(), {
    buttonSize: '300px',
})
debugger
</script>

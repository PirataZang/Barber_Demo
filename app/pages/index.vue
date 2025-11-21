<template>
    <div class="space-y-2 p-2">
        <UContainer class="h-40 rounded border border-gray-300">
            <span>aaaa</span>
            <UserForm buttonSize="400px" />
        </UContainer>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'default',
})

const updateName = async () => {
    const payload = {
        id: 'vkEQY8yEclJOtUrB8I6flcrndxvmrQcW',
        name: 'Igor Fronza Final 19',
    }

    try {
        const response = await useFetch('/api/user/user-update', {
            method: 'POST', // O método POST
            body: payload,
        })

    } catch (error) {
        alert('Falha ao atualizar o usuário.')
    }
}


</script>

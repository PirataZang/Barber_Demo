<template>
    <Modal label="Configurações" button-variant="subtle" modal modal-title="Configurações do Usuário" @open="reloadUser"  description="Configurações relacionadas ao usuário" modal-width="w-auto max-w-lg">
        <UForm :schema="schema" :state="form" class="flex flex-col gap-2 space-y-4" @submit="onSubmit">
            <div class="flex flex-row gap-4">
                <ClientOnly>
                    <UFormField label="Nome" name="name">
                        <UInput v-model="form.name" required />
                    </UFormField>

                    <UFormField label="Email" name="email">
                        <UInput disabled v-model="form.email" />
                    </UFormField>
                </ClientOnly>
            </div>

            <div ref="footer" class="flex gap-2">
                <UButton type="submit" class="w-fit" :loading="isSaving" :disabled="isSaving"> Salvar </UButton>
            </div>
        </UForm>
    </Modal>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '~/lib/auth-client'

// ---- Schema ----
const schema = v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email('Informe um email válido')),
})

type Schema = v.InferOutput<typeof schema>

// ---- Reactive Form ----
const form = reactive<Schema>({
    name: '',
    email: '',
})

// ---- Estados ----
const isSaving = ref(false)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isSaving.value = true

        const user = await useFetch('/api/user/user-update', {
            method: 'POST',
            body: {
                id: (await authClient.getSession()).data?.user.id,
                name: event.data.name,
            },
        })

        // Simulação de chamada para salvar
        await new Promise((res) => setTimeout(res, 1000))

        toast.add({
            title: 'Success',
            description: 'Informações foram salvas com sucesso.',
            color: 'success',
        })

        console.log(event.data)
    } finally {
        isSaving.value = false
    }
}

// ---- Props ----
interface Props {
    id: any
    buttonSize?: string
    label?: string
    colorButton?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}
const props = withDefaults(defineProps<Props>(), {
    buttonSize: '300px',
    label: 'Configurações',
    colorButton: 'neutral',
})

// ---- Carregar dados do usuário ----
const reloadUser = async () => {
    try {
        const payload = { id: props.id }

        if (!payload.id) {
            throw new Error('User ID is required to fetch user data')
        }

        const { data: userData, error } = await useFetch('/api/user/user', {
            method: 'POST',
            body: payload,
        })

        if (error.value) throw new Error('Failed to fetch user data')

        // preencher reactive
        form.name = userData.value?.name || ''
        form.email = userData.value?.email || ''
    } catch (error) {
        console.error('Error fetching user data:', error)
    }
}
</script>

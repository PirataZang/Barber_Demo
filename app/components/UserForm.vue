<template>
    <UModal :class="[`w-[${props?.buttonSize}]`]" title="Configurações do Usuário" description="Configurações relacionadas ao usuário">
        <UButton label="Configurações do Usuário" color="neutral" variant="subtle" />

        <template #body>
            <UForm :schema="schema" :state="form" class="flex flex-col gap-2 space-y-4" @submit="onSubmit">
                <div class="flex flex-row gap-4">
                    <UFormField label="Email" name="email">
                        <UInput v-model="form.email" />
                    </UFormField>
    
                    <UFormField label="Password" name="password">
                        <UInput v-model="form.password" type="password" />
                    </UFormField>
                </div>

                <div ref="footer" class="flex gap-2">
                    <UButton type="submit" class="w-fit"> Submit </UButton>
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = v.object({
    email: v.pipe(v.string(), v.email('Informe um email válido')),
    password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
})

type Schema = v.InferOutput<typeof schema>

const form = reactive({
    email: '',
    password: '',
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.add({ title: 'Success', description: 'Informações foram salvas com sucesso.', color: 'success' })
    console.log(event.data)
}

interface Props {
    buttonSize?: string
}

// defineProps com tipagem + withDefaults para valores padrão
const props = withDefaults(defineProps<Props>(), {
    buttonSize: '300px',
})

const reloadUser = async () => {
    try {
        const { data: userData, error } = await useFetch('/api/user/user', {
            method: 'GET',
        })
        debugger

        if (error.value) {
            throw new Error('Failed to fetch user data')
        }
    } catch (error) {
        console.error('Error fetching user data:', error)
    }
}

onMounted(async () => {
    reloadUser()
})

</script>

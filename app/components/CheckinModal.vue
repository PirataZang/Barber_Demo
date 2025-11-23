<template>
    <Modal label="Agendar" button-variant="solid" button-color="neutral" modal-title="Agendamentos" modal-width="500px">
        <UForm :schema="schema" :state="form" class="flex flex-col gap-2 space-y-4" @submit="onSubmit">
            <UFormGroup label="Selecione a Data" name="date">
                <UCalendar v-model="form.date" :is-date-unavailable="isDateUnavailable" color="neutral" class="text-white" />
            </UFormGroup>

            <UFormGroup label="Selecione o Horário" name="time">
                <USelect v-model="form.time" :options="availableTimes" placeholder="Selecione o horário" value-attribute="value" option-attribute="label" />
            </UFormGroup>

            <UButton type="submit" label="Salvar Agendamento" :loading="isSaving" block />
        </UForm>
    </Modal>
</template>

<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'

// ---- Props ----

const prop = defineProps<{
    serviceId: string
    userId?: string
    time: number
}>()

// ---- Data & Funções Auxiliares ----

const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
const isDateUnavailable = (date: DateValue) => {
    return date.compare(today) < 0
}

const generateAvailableTimes = (startHour = 8, endHour = 18, intervalMinutes = 30) => {
    // [Lógica para gerar horários]
    const times = []
    let currentTime = startHour * 60
    while (currentTime < endHour * 60) {
        const hour = Math.floor(currentTime / 60) % 24
        const minute = currentTime % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push({ label: timeString, value: timeString })
        currentTime += intervalMinutes
    }
    return times
}
const availableTimes = generateAvailableTimes()

const modelValueCalendar = shallowRef(today)

const form = reactive({
    date: modelValueCalendar.value as CalendarDate,
    time: availableTimes[0]?.value || '08:00', // String "HH:mm"
})

const isSaving = ref(false)
const toast = useToast()

// ---- Schema ----
const schema = v.object({
    date: v.pipe(v.any(), v.nonEmpty('A data é obrigatória')),
    time: v.pipe(v.string(), v.nonEmpty('O horário é obrigatório')),
})

type Schema = v.InferOutput<typeof schema>

// ---- Funções de Submissão ----

async function onSubmit(event: FormSubmitEvent<Schema>) {
    const dateData = event.data.date as CalendarDate
    const timeString = event.data.time as string

    const [hours, minutes] = timeString.split(':').map(Number)

    const finalDateTime = new Date(
        dateData.year,
        dateData.month - 1, // Mês baseado em 0
        dateData.day,
        hours,
        minutes,
        0
    )

    const finalPayload = {
        date: finalDateTime.toISOString(),
        userId: prop.userId,
        serviceId: prop.serviceId,
    }

    try {
        isSaving.value = true

        const save = await useFetch('/api/checkin/checkin-create', {
            method: 'POST',
            body: finalPayload,
        })

        toast.add({
            title: 'Success',
            description: 'Agendamento salvo com sucesso.',
            color: 'success',
        })
    } finally {
        isSaving.value = false
    }
}
</script>

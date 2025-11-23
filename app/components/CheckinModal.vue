<template>
    <Modal label="Agendar" button-variant="solid" button-color="neutral" modal-title="Agendamentos" modal-width="w-auto max-w-sm">
        <UForm :schema="schema" :state="form" class="flex flex-col gap-2 space-y-4" @submit="onSubmit">
            <UFormField label="Selecione a Data" name="date">
                <UCalendar locale="pt-BR" :year-controls="false" v-model="form.date" :is-date-unavailable="isDateUnavailable" color="neutral" class="text-white" />
            </UFormField>

            <ClientOnly>
                <UFormField label="Selecione o Horário" name="time">
                    <div class="flex gap-2 overflow-x-auto time-scroll-hide whitespace-nowrap py-1">
                        <UButton v-for="timeOption in availableTimes" :key="timeOption.value" :label="timeOption.label" :variant="form.time === timeOption.value ? 'solid' : 'outline'" color="neutral" @click="form.time = timeOption.value" size="lg" class="flex-shrink-0" />
                    </div>
                    <span v-if="pending" class="text-xs text-gray-400">Carregando horários...</span>
                    <span v-else-if="availableTimes.length === 0" class="text-xs text-red-400">Nenhum horário disponível para esta data.</span>
                </UFormField>

                <template #fallback>
                    <div class="h-10 w-full bg-gray-600 rounded-lg animate-pulse"></div>
                </template>
            </ClientOnly>

            <UButton type="submit" label="Salvar Agendamento" size="xl" variant="subtle" color="neutral" :loading="isSaving" block />
        </UForm>
    </Modal>
</template>

<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'

const prop = defineProps<{
    serviceId: string
    userId?: string
    time: number
}>()

const toast = useToast()
const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

const isDateUnavailable = (date: DateValue) => {
    if (date.compare(today) < 0) {
        return true
    }
    const jsDate = date.toDate(new Date().timeZone || 'UTC')
    if (jsDate.getDay() < 0 || jsDate.getDay() >= 6) {
        return true
    }
    return false
}

// Nota: A lista de feriados (holidays2025) e a função isHoliday()
// foram removidas, conforme sua solicitação.

const generateAllPossibleTimes = (startHour = 8, endHour = 18, intervalMinutes: number) => {
    const times = []
    let currentTime = startHour * 60
    const endMinutes = endHour * 60

    while (currentTime < endMinutes) {
        const hour = Math.floor(currentTime / 60) % 24
        const minute = currentTime % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push({ label: timeString, value: timeString })
        currentTime += intervalMinutes
    }
    return times
}

const calendarDateToISOString = (date: CalendarDate): string => {
    const jsDate = new Date(date.year, date.month - 1, date.day)
    jsDate.setMinutes(jsDate.getMinutes() - jsDate.getTimezoneOffset())
    return jsDate.toISOString()
}

const isSaving = ref(false)

const form = reactive({
    date: shallowRef(today).value as CalendarDate,
    time: '',
})

const {
    data: bookedCheckins,
    pending,
    refresh,
} = await useFetch('/api/checkin/checkin', {
    query: {
        date: computed(() => calendarDateToISOString(form.date)),
    },
    immediate: true,
    lazy: true,
})

const availableTimes = computed(() => {
    const allPossibleTimes = generateAllPossibleTimes(8, 18, prop.time)

    // A espera e a ausência de checkins ainda retornam todos os horários
    if (pending.value || !bookedCheckins.value || bookedCheckins.value.length === 0) {
        return allPossibleTimes
    }

    const occupiedTimes = new Set<string>()

    for (const checkin of bookedCheckins.value) {
        const checkinDate = new Date(checkin.date)

        const hour = checkinDate.getUTCHours().toString().padStart(2, '0')
        const minute = checkinDate.getUTCMinutes().toString().padStart(2, '0')
        occupiedTimes.add(`${hour}:${minute}`)
    }

    return allPossibleTimes.filter((time) => !occupiedTimes.has(time.value))
})

watch(
    availableTimes,
    (newTimes) => {
        if (newTimes.length > 0) {
            const currentTimeIsAvailable = newTimes.some((t) => t.value === form.time)
            if (!currentTimeIsAvailable || !form.time) {
                form.time = newTimes[0].value
            }
        } else {
            form.time = ''
        }
    },
    { immediate: true }
)

const schema = v.object({
    date: v.pipe(v.any(), v.nonEmpty('A data é obrigatória')),
    time: v.pipe(v.string(), v.nonEmpty('O horário é obrigatório')),
})

type Schema = v.InferOutput<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isSaving.value = true

    try {
        const dateData = event.data.date as CalendarDate
        const timeString = event.data.time as string
        const [hours, minutes] = timeString.split(':').map(Number)

        // 1. Cria o objeto Date no FUSO HORÁRIO LOCAL (navegador)
        const localDateTime = new Date(dateData.year, dateData.month - 1, dateData.day, hours, minutes, 0)

        // 2. Neutraliza o offset do fuso horário local antes de converter para ISO
        // Isso força a string ISO resultante (que é UTC) a ser exatamente o horário local desejado.
        const timezoneOffset = localDateTime.getTimezoneOffset()
        const finalDateTime = new Date(localDateTime.getTime() - timezoneOffset * 60000)

        const finalPayload = {
            date: finalDateTime.toISOString(), // Ex: '2025-11-23T14:00:00.000Z'
            userId: prop.userId,
            serviceId: prop.serviceId,
        }

        const { error } = await useFetch('/api/checkin/checkin-create', {
            method: 'POST',
            body: finalPayload,
        })

        if (error.value) {
            toast.add({
                title: 'Erro',
                description: error.value.message || 'Não foi possível salvar o agendamento.',
                color: 'error',
            })
        }

        toast.add({
            title: 'Sucesso',
            description: 'Agendamento salvo com sucesso.',
            color: 'success',
        })
        isSaving.value = false
        return navigateTo('/booking')
    } catch (error) {
        toast.add({
            title: 'Erro',
            description: 'Não foi possível salvar o agendamento.',
            color: 'error',
        })
        console.error('Erro ao salvar agendamento:', error)
    } finally {
        isSaving.value = false
    }
}
</script>

<style scoped>
.time-scroll-hide {
    /* Esconde a barra de rolagem no Firefox */
    scrollbar-width: none;
}
</style>

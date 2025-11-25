<template>
    <Modal label="Agendar" button-variant="solid" button-color="neutral" modal-title="Agendamentos" modal-width="w-auto max-w-sm" @open="refresh()">
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
                    <span v-else-if="availableTimes.length === 0" class="text-xs text-red-400"> Nenhum horário disponível para esta data. </span>
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
    if (date.compare(today) < 0) return true

    const jsDate = date.toDate(new Date().timeZone || 'UTC')
    return jsDate.getDay() === 0
}

const generateAllPossibleTimes = (startHour = 8, endHour = 18, intervalMinutes: number) => {
    const times = []
    let currentTime = startHour * 60
    const endMinutes = endHour * 60

    while (currentTime < endMinutes) {
        const hour = Math.floor(currentTime / 60)
        const minute = currentTime % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push({ label: timeString, value: timeString })
        currentTime += intervalMinutes
    }
    return times
}

const isSaving = ref(false)

const form = reactive({
    date: shallowRef(today).value as CalendarDate,
    time: '',
})

// 🔥 Agora carrega TODOS os checkins (sem filtro de userId)
const {
    data: allCheckins,
    pending,
    refresh,
} = await useFetch('/api/checkin/checkin', {
    immediate: true,
    lazy: true,
})

// 🔥 Filtro dos checkins do mesmo dia selecionado E mesmo serviço
const checkinsForSelectedDay = computed(() => {
    if (!allCheckins.value) return []

    return allCheckins.value.filter((c) => {
        const d = new Date(c.date)
        // Filtra apenas checkins do mesmo dia e mesmo serviço
        return (
            d.getFullYear() === form.date.year &&
            d.getMonth() + 1 === form.date.month &&
            d.getDate() === form.date.day &&
            c.serviceId === prop.serviceId
        )
    })
})

const availableTimes = computed(() => {
    const allPossibleTimes = generateAllPossibleTimes(8, 18, prop.time)
    const now = new Date()
    const selectedIsToday =
        now.getFullYear() === form.date.year &&
        now.getMonth() === form.date.month - 1 &&
        now.getDate() === form.date.day

    if (pending.value || !checkinsForSelectedDay.value) return allPossibleTimes

    // Build set of occupied times for this service on selected day
    const occupied = new Set(
        checkinsForSelectedDay.value.map((c) => {
            const d = new Date(c.date)
            const h = d.getHours().toString().padStart(2, '0')
            const m = d.getMinutes().toString().padStart(2, '0')
            return `${h}:${m}`
        })
    )

    // Filter out occupied times and past times (if today)
    return allPossibleTimes.filter((timeOption) => {
        // exclude occupied
        if (occupied.has(timeOption.value)) return false

        // exclude past times only when selected date is today
        if (selectedIsToday) {
            const [h, m] = timeOption.value.split(':').map(Number)
            const optionDate = new Date(form.date.year, form.date.month - 1, form.date.day, h, m)
            if (optionDate < now) return false
        }

        return true
    })
})

watch(
    availableTimes,
    (list) => {
        if (list.length === 0) form.time = ''
        else if (!list.some((t) => t.value === form.time)) form.time = list[0].value
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
        const [hours, minutes] = event.data.time.split(':').map(Number)

        const local = new Date(dateData.year, dateData.month - 1, dateData.day, hours, minutes)
        const offset = local.getTimezoneOffset()
        const finalDateTime = new Date(local.getTime() - offset * 60000)

        const finalPayload = {
            date: finalDateTime.toISOString(),
            userId: prop.userId,
            serviceId: prop.serviceId,
        }

        const { error } = await useFetch('/api/checkin/checkin-create', {
            method: 'POST',
            body: finalPayload,
        })

        if (error.value) {
            toast.add({
                title: 'Horário indisponível',
                description: 'Já existe um agendamento neste horário.',
                color: 'error',
            })
            return
        }

        toast.add({
            title: 'Sucesso',
            description: 'Agendamento salvo.',
            color: 'success',
        })

        return navigateTo('/booking')
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

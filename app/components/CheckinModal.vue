<template>
    <Modal label="Agendar" button-variant="solid" button-color="neutral" modal-title="Agendamentos" modal-width="500px">
        <UForm :schema="schema" :state="form" class="flex flex-col gap-2 space-y-4" @submit="onSubmit">
            <UFormField label="Selecione a Data" name="date">
                <UCalendar v-model="form.date" :is-date-unavailable="isDateUnavailable" color="neutral" class="text-white" />
            </UFormField>

            <ClientOnly>
                <UFormField label="Selecione o Horário" name="time">
                    <USelect v-model="form.time" :options="availableTimes" placeholder="Selecione o horário" value-attribute="value" option-attribute="label" />
                </UFormField>
                
                <template #fallback>
                    <div class="h-10 w-24 bg-gray-600 rounded-lg animate-pulse"></div>
                </template>
            </ClientOnly>

            <UButton type="submit" label="Salvar Agendamento" :loading="isSaving" block />
        </UForm>
    </Modal>
</template>

<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'

// ==============================
// 📦 PROPS & COMPONENT SETUP
// ==============================

const prop = defineProps<{
    serviceId: string
    userId?: string
    // Intervalo de agendamento em minutos (e.g., 30, 60)
    time: number
}>()

const toast = useToast()

// ==============================
// ⚙️ LÓGICA & FUNÇÕES AUXILIARES
// ==============================

const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

/** Verifica se a data é anterior ao dia atual. */
const isDateUnavailable = (date: DateValue) => {
    return date.compare(today) < 0
}

/** Gera a lista de horários com base no intervalo. */
const generateAvailableTimes = (startHour = 8, endHour = 18, intervalMinutes: number) => {
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

// ==============================
// 📊 ESTADO REATIVO (DATA)
// ==============================

/** Lista de horários disponíveis, reativa à prop.time. */
const availableTimes = computed(() => {
    // Isso é reativo: sempre que prop.time muda, esta lista recalcula.
    return generateAvailableTimes(8, 18, prop.time)
})

const isSaving = ref(false)

const form = reactive({
    date: shallowRef(today).value as CalendarDate,
    // O valor inicial é definido aqui com o primeiro horário baseado no prop.time.
    time: availableTimes.value[0]?.value || '08:00',
})

// === NOVO WATCH: Reage APENAS se a prop 'time' MUDAR DINAMICAMENTE ===
// Este watch garante que, se o componente já estiver aberto e a prop.time mudar
// (o que recarrega availableTimes), o form.time seja resetado para o primeiro novo horário.
watch(availableTimes, (newTimes, oldTimes) => {
    // Verifica se a lista de horários realmente mudou (devido à prop.time)
    // E se o horário atualmente selecionado não está mais na nova lista.
    if (newTimes.length > 0 && oldTimes.length > 0 && newTimes[0].value !== oldTimes[0].value) {
        form.time = newTimes[0].value
    }
})
// === O WATCH IMEDIATO FOI REMOVIDO ===

// ==============================
// 📋 SCHEMA DE VALIDAÇÃO
// ==============================

const schema = v.object({
    date: v.pipe(v.any(), v.nonEmpty('A data é obrigatória')),
    time: v.pipe(v.string(), v.nonEmpty('O horário é obrigatório')),
})

type Schema = v.InferOutput<typeof schema>

// ==============================
// 🚀 FUNÇÃO DE SUBMISSÃO
// ==============================

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isSaving.value = true

    try {
        const dateData = event.data.date as CalendarDate
        const timeString = event.data.time as string
        const [hours, minutes] = timeString.split(':').map(Number)

        // Cria o objeto Date final, com o mês ajustado (base 0)
        const finalDateTime = new Date(dateData.year, dateData.month - 1, dateData.day, hours, minutes, 0)

        const finalPayload = {
            date: finalDateTime.toISOString(),
            userId: prop.userId,
            serviceId: prop.serviceId,
        }

        await useFetch('/api/checkin/checkin-create', {
            method: 'POST',
            body: finalPayload,
        })

        toast.add({
            title: 'Sucesso',
            description: 'Agendamento salvo com sucesso.',
            color: 'success',
        })
    } catch (error) {
        toast.add({
            title: 'Erro',
            description: 'Não foi possível salvar o agendamento.',
            color: 'error',
        })
    } finally {
        isSaving.value = false
    }
}
</script>

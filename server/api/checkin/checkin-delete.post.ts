import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const dateParam = body?.date as string | undefined

        if (!dateParam) {
            throw createError({ statusCode: 400, statusMessage: 'A data (date) é obrigatória.' })
        }

        const baseDate = new Date(dateParam)

        // 2. Define o início do dia (00:00:00.000) no fuso horário LOCAL.
        const startOfDayTimestamp = baseDate.setHours(0, 0, 0, 0)
        const startOfDay = new Date(startOfDayTimestamp)

        // 3. Define o fim do dia (23:59:59.999) no fuso horário LOCAL.
        const endOfDayTimestamp = baseDate.setHours(23, 59, 59, 999)
        const endOfDay = new Date(endOfDayTimestamp)

        const whereClause: any = {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        }

        const deleted = await prisma.checkin.deleteMany({
            where: whereClause,
        })

        // Retorna o objeto que indica quantos registros foram deletados (count)
        return deleted
    } catch (error) {
        console.error('Erro ao deletar check-ins:', error)
        throw createError({ statusCode: 500, statusMessage: 'Não foi possível deletar os check-ins.' })
    }
})

import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, getQuery } from 'h3'

interface Query {
    date: string
}

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery<Query>(event)

        if (!query.date) {
            throw createError({
                statusCode: 400,
                statusMessage: 'A data é obrigatória (parâmetro "date").',
            })
        }

        const selectedDate = new Date(query.date)

        const startOfDay = selectedDate

        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate() + 1)
        endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1)

        const checkins = await prisma.checkin.findMany({
            where: {
                date: {
                    gte: startOfDay, // Greater Than or Equal (Maior ou igual)
                    lte: endOfDay, // Less Than or Equal (Menor ou igual)
                },
            },
            select: {
                date: true,
                serviceId: true,
            },
        })

        // 3. Retorna os dados como JSON
        return checkins
    } catch (error) {
        console.error('Erro ao buscar checkins no banco de dados:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Não foi possível buscar os agendamentos existentes.',
        })
    }
})

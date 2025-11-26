import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        // Leia query (opcional date) e body (opcional userId)
        const query = getQuery(event)
        const body = await readBody(event)
        const userId = body?.userId as string | undefined
        const dateParam = (query as any)?.date as string | undefined

        // Build where clause: optional userId, optional date range
        const whereClause: any = {}
        if (userId) whereClause.userId = userId
        // By default, exclude canceled checkins unless explicitly requested
        if (!body?.includeCanceled) {
            whereClause.canceled = false
        }

        if (dateParam) {
            const selectedDate = new Date(dateParam)
            const startOfDay = new Date(selectedDate)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(startOfDay)
            endOfDay.setDate(endOfDay.getDate() + 1)
            endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1)

            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay,
            }
        }

        const userBookings = await prisma.checkin.findMany({
            where: whereClause,
            select: {
                id: true,
                userId: true,
                serviceId: true,
                date: true,
                canceled: true,
                canceledAt: true,
                createdAt: true,
                updatedAt: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        image: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
        })

        return userBookings
    } catch (error) {
        console.error('Erro ao buscar checkins no banco de dados:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Não foi possível buscar os agendamentos existentes.',
        })
    }
})

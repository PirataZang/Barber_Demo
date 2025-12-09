import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        // Leia query (opcional date) e body (opcional userId)
        const query = getQuery(event)
        const body = await readBody(event)
        const userId = body?.userId as string | undefined
        const dateStart = query?.dateStart as string | undefined
        const dateEnd = query?.dateEnd as string | undefined

        // Build where clause: optional userId, optional date range
        const whereClause: any = {}
        if (userId) whereClause.userId = userId
        // By default, exclude canceled checkins unless explicitly requested
        if (!body?.includeCanceled) {
            whereClause.canceled = false
        }

        if (dateStart || dateEnd) {
            whereClause.date = {
                gte: null,
                lte: null,
            }
            if (dateStart) {
                const startOfDay = new Date(dateStart)
                startOfDay.setUTCHours(0, 0, 0, 0)
                whereClause.date.gte = startOfDay.toISOString() // '2025-12-08T00:00:00.000Z'
            }

            if (dateEnd) {
                const endOfDay = new Date(dateEnd)
                endOfDay.setUTCHours(23, 59, 59, 999)
                whereClause.date.lte = endOfDay.toISOString() // '2025-12-08T23:59:59.999Z'
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

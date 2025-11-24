import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        // Leia o body e procure por userId
        const body = await readBody(event)
        const userId = body?.userId as string | undefined

        // Quando userId for fornecido, retorna todos os agendamentos desse usuário.
        // Caso contrário, retorna todos os checkins.
        const whereClause: any = {}
        if (userId) whereClause.userId = userId

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

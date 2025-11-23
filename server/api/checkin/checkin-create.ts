import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const existingCheckin = await prisma.checkin.findFirst({
        where: {
            date: body.date,
            serviceId: body.barberId,
        },
    })

    if (existingCheckin) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Já existe um agendamento para este horário.',
        })
    }

    const checkin = await prisma.checkin.create({
        data: {
            ...body,
        },
    })

    return checkin
})

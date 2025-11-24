import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const dateParam = body?.date as string | undefined
    const serviceId = body?.serviceId as string | undefined

    if (!dateParam) {
      throw createError({ statusCode: 400, statusMessage: 'A data (date) é obrigatória.' })
    }

    const selectedDate = new Date(dateParam)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)
    endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1)

    const whereClause: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      canceled: false,
    }

    if (serviceId) whereClause.serviceId = serviceId

    const reserved = await prisma.checkin.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        serviceId: true,
        userId: true,
      },
      orderBy: { date: 'asc' },
    })

    // Return reserved slots; clients can compute available slots from service duration
    return { reserved }
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível buscar disponibilidade.' })
  }
})

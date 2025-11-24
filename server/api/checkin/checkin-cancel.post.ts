import { prisma } from '~/lib/prisma'
import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body?.id as string | undefined

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'O id do checkin é obrigatório.' })
    }

    // Marca como cancelado
    const canceled = await prisma.checkin.update({
      where: { id },
      data: {
        canceled: true,
        canceledAt: new Date(),
      },
      include: {
        service: true,
        user: true,
      },
    })

    return canceled
  } catch (error) {
    console.error('Erro ao cancelar checkin:', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível cancelar o agendamento.' })
  }
})

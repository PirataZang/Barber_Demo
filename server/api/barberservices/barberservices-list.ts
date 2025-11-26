import { prisma } from '~/lib/prisma'

export default defineEventHandler(async () => {
    const services = await prisma.barberService.findMany({
        orderBy: { id: 'asc' },
    })

    if (!services) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Não foi possível buscar os dados de serviços de barbearia no servidor.',
        })
    }
    
    return services
})

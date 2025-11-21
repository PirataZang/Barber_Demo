import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {

    const body = await readBody(event)
    const userId = body?.id
    
    return prisma.user.findUnique({
        where: { id: userId },
    })
})

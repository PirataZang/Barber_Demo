import { prisma } from '~/lib/prisma'
import { auth } from '~/lib/auth'
import { authClient } from '~/lib/auth-client'

export default defineEventHandler(async (event) => {
    const session = await authClient.getSession(event)

    if (!session) {
        throw createError({ statusCode: 401, message: 'Not authenticated' })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    return user
})

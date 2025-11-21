import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')

    if (token) {
        await prisma.user.updateMany({
            where: { token },
            data: { token: null },
        })
    }

    deleteCookie(event, 'auth_token')

    return { message: 'Deslogado' }
})

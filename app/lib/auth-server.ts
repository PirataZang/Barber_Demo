import { betterAuth } from 'better-auth'
import { prisma } from '~/lib/prisma'

export const auth = betterAuth({
    database: {
        type: 'prisma',
        client: prisma,
    },
    // Coloque aqui as mesmas configs do seu auth-client
})

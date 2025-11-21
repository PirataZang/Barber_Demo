import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '~/lib/prisma'
// If your Prisma file is located elsewhere, you can change the path
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql', // or "mysql", "", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            prompt: 'select_account',
            clientId: process.env.NUXT_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET as string,
        },
    },
})

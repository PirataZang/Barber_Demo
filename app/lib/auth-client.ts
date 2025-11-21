import { createAuthClient } from 'better-auth/vue'
export const authClient = createAuthClient({
    // se precisar, define baseURL = onde está seu servidor auth
    baseURL: process.env.NUXT_PUBLIC_BASE_URL,
})

const signIn = async () => {
    const data = await authClient.signIn.social({
        provider: 'google',
    })
}
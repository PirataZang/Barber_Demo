import { authClient } from '~/lib/auth-client'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data: session } = await authClient.useSession(useFetch)

    const pagesPublic = ['/']

    if (!session.value) 
        return navigateTo('/')

    debugger
    if (!pagesPublic.includes(to.path) && !session.value?.user)
        return navigateTo('/')
})

import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data: session } = await authClient.useSession(useFetch)

    const pagesPublic = ['/', '/booking']

    // Allow if destination OR origin is a public route
    if (pagesPublic.includes(to.path) || pagesPublic.includes(from.path))
        return

    // Allow full access for admin users
    if ((session.value?.user as any)?.isAdmin)
        return

    // If not authenticated, redirect to root
    if (!session.value)
        return navigateTo('/')

    // Otherwise allow navigation (authenticated non-admin)
    return
})

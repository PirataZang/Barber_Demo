import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const user = await prisma.user.findUnique({
        where: { email: body.email },
    })

    if (!user || user.password !== body.password) {
        throw createError({
            statusCode: 401,
            message: 'Credenciais inválidas',
        })
    }

    // gerar token novo
    const token = crypto.randomUUID()

    // salvar no banco
    await prisma.user.update({
        where: { id: user.id },
        data: { token },
    })

   setCookie(event, 'auth_token', token, {
        httpOnly: true,
        sameSite: 'lax', 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // Opcional: Adicionar tempo de vida (7 dias, por exemplo)
        secure: process.env.NODE_ENV === 'production', 
    })
    return { message: 'Logado com sucesso!' }
})

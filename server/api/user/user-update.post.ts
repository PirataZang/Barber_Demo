import { prisma } from '~/lib/prisma'

// Define o handler da rota GET /api/users
export default defineEventHandler(async (event: any) => {
    // 1. Leia o corpo da requisição e aguarde a resposta
    const body = await readBody(event)
    try {
        const updateUser = await prisma.user.update({
            where: {
                id: 'vkEQY8yEclJOtUrB8I6flcrndxvmrQcW',
            },
            data: {
                name: body?.name,
            },
        })

        // 2. Retorna os dados como JSON
        return updateUser
    } catch (error) {
        // 3. Em caso de erro, lança uma exceção do servidor
        console.error('Erro ao buscar usuários no banco de dados:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Não foi possível buscar os dados de usuários no servidor.',
        })
    }
})

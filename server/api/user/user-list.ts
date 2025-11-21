import { prisma } from '~/lib/prisma'

// Define o handler da rota GET /api/users
export default defineEventHandler(async () => {
    try {
        // 1. Acesso ao banco de dados usando Prisma (somente no servidor)
        const users = await prisma.user.findMany({
            // Exemplo: Selecionar apenas ID, nome e email por segurança
            select: {
                id: true,
                name: true,
                email: true,
            },
        })

        // 2. Retorna os dados como JSON
        return users
    } catch (error) {
        // 3. Em caso de erro, lança uma exceção do servidor
        console.error('Erro ao buscar usuários no banco de dados:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Não foi possível buscar os dados de usuários no servidor.',
        })
    }
})

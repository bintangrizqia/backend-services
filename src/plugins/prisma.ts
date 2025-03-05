import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'

// Create a singleton instance of Prisma Client
export const prisma = new PrismaClient()

interface PrismaPluginOptions {
  // Custom options for plugin
}

const prismaPlugin: FastifyPluginAsync<PrismaPluginOptions> = async (fastify, options) => {
  fastify.decorate('prisma', prisma)
  
  fastify.addHook('onClose', async (instance) => {
    await prisma.$disconnect()
  })
}

// Declaration merging for Fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(prismaPlugin, { name: 'prisma' })

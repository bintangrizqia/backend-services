import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import bcrypt from 'bcrypt'

// Define request body types for type safety
interface LoginRequest {
  npp: string
  password: string
}

interface RegisterRequest {
  npp: string
  name: string
  email?: string
  password: string
  photo?: string
}

export class AuthController extends BaseController {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  /**
   * Login with NPP and password
   */
  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { npp, password } = request.body

      // Find user by NPP
      const user = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      // Check if user exists
      if (!user) {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Invalid NPP or password'
        })
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Invalid NPP or password'
        })
      }

      // Generate JWT token with embedded permissions
      const token = await this.fastify.generateToken(user.id)

      // Return user data and token
      return this.sendResponse(reply, {
        user: {
          id: user.id,
          npp: user.npp,
          name: user.name,
          email: user.email,
          is_superuser: user.is_superuser
        },
        token
      })
    } catch (error) {
      return this.handleError(error, reply, 'Login failed')
    }
  }

  /**
   * Register a new user
   */
  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const { npp, name, email, password, photo } = request.body

      // Check if user already exists
      const existingUser = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      if (existingUser) {
        return reply.status(409).send({
          error: 'Registration failed',
          message: 'NPP already exists'
        })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create new user
      const newUser = await this.prisma.personnels.create({
        data: {
          npp,
          name,
          email,
          password: hashedPassword,
          photo
        }
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser

      return this.sendResponse(reply, userWithoutPassword, 201)
    } catch (error) {
      return this.handleError(error, reply, 'Registration failed')
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      // User is already attached to request by auth middleware
      const user = request.user

      if (!user) {
        return reply.status(401).send({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        })
      }

      // Include permissions in the response
      const userData = {
        ...user,
        permissions: request.permissions
      }
      
      return this.sendResponse(reply, userData)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve user information')
    }
  }
}

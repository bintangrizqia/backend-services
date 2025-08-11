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
  eselon?: number
  is_superuser?: boolean
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

      if (!npp || npp.trim() === '') {
        return reply.status(400).send({
          error: 'Authentication failed',
          message: 'NPP cannot be empty.'
        })
      }

      if (!password || password.trim() === '') {
        return reply.status(400).send({
          error: 'Authentication failed',
          message: 'Password cannot be empty.'
        })
      }

      // Find user by NPP with eselon
      const user = await this.prisma.personnels.findUnique({
        where: { npp },
        select: {
          id: true,
          npp: true,
          name: true,
          email: true,
          photo: true,
          password: true,
          eselon: true,
          is_superuser: true,
          active: true
        }
      })

      // Check if user exists and is active
      if (!user) {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Invalid NPP or password'
        })
      }

      if (!user.active) {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Account is inactive'
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

      // Generate JWT token (updated to use user.id instead of user.npp)
      const token = await this.fastify.generateToken(user.id)

      // Determine user role for frontend
      const getRoleFromEselon = (eselon: number, isSuperuser: boolean): string => {
        if (isSuperuser) return 'SUPER_ADMIN'
        switch (eselon) {
          case -1: return 'ADMIN'
          case 1:
          case 2: return 'MANAGER'
          default: return 'STAFF'
        }
      }

      const role = getRoleFromEselon(user.eselon || 5, user.is_superuser)

      // Return user data and token (without password)
      return this.sendResponse(reply, {
        user: {
          npp: user.npp,
          name: user.name,
          email: user.email,
          photo: user.photo,
          eselon: user.eselon,
          is_superuser: user.is_superuser,
          role // Frontend bisa pakai ini untuk routing/menu
        },
        token,
        role
      })
    } catch (error) {
      return this.handleError(error, reply, 'Login failed')
    }
  }

  /**
   * Register a new user (Simplified - hanya untuk SUPER_ADMIN)
   */
  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const { 
        npp, 
        name, 
        email, 
        password, 
        photo,
        eselon = 5,  // Default ke staff
        is_superuser = false
      } = request.body

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

      // Validate eselon
     if (![-1, 1, 2, 3, 4, 5].includes(eselon)) {
        return reply.status(400).send({
          error: 'Registration failed',
          message: 'Invalid eselon value'
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
          photo,
          eselon,
          is_superuser,
          active: true
        },
        select: {
          npp: true,
          name: true,
          email: true,
          photo: true,
          eselon: true,
          is_superuser: true,
          active: true,
          created_at: true
        }
      })

      return this.sendResponse(reply, { 
        message: 'User registered successfully',
        user: newUser 
      }, 201)
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

      // Get user role
      const getRoleFromEselon = (eselon: number, isSuperuser: boolean): string => {
        if (isSuperuser) return 'SUPER_ADMIN'
        switch (eselon) {
          case -1: return 'ADMIN'
          case 1:
          case 2: return 'MANAGER'
          default: return 'STAFF'
        }
      }

      const role = getRoleFromEselon(user.eselon || 5, user.is_superuser)

      // Include role in the response (no more permissions)
      const userData = {
        ...user,
        role
      }
      
      return this.sendResponse(reply, userData)
    } catch (error) {
      return this.handleError(error, reply, 'Failed to retrieve user information')
    }
  }

  /**
   * Logout (Optional - untuk clear token di frontend)
   */
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      // JWT stateless, jadi logout hanya response success
      // Frontend yang handle hapus token dari storage
      
      return this.sendResponse(reply, {
        message: 'Logged out successfully'
      })
    } catch (error) {
      return this.handleError(error, reply, 'Logout failed')
    }
  }

  /**
   * Refresh token (Optional)
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user

      if (!user) {
        return reply.status(401).send({
          error: 'Authentication required',
          message: 'You must be logged in to refresh token'
        })
      }

      // Generate new token
      const newToken = await this.fastify.generateToken(user.npp)

      return this.sendResponse(reply, {
        token: newToken,
        message: 'Token refreshed successfully'
      })
    } catch (error) {
      return this.handleError(error, reply, 'Token refresh failed')
    }
  }
}
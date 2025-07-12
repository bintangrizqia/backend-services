import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BaseController } from './base.controller'
import bcrypt from 'bcrypt'
import { Permission, Resource } from '@prisma/client'

// Define request body types for type safety
interface LoginRequest {
  npp: string
  password: string
}

interface PermissionItem {
  resource: Resource
  permission: Permission
}

interface RegisterRequest {
  npp: string
  name: string
  email?: string
  password: string
  photo?: string
  is_superuser?: boolean
  groups?: string[]
  permissions?: PermissionItem[]
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

      if (npp === null || npp === '') {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Npp cannot be empty.'
        })
      }

      if (password === null || npp === '') {
        return reply.status(401).send({
          error: 'Authentication failed',
          message: 'Password cannot be empty.'
        })
      }

      // Find user by NPP
      const user = await this.prisma.personnels.findUnique({
        where: { npp }
      })

      // Check if user exists
      if (!user) {
        return reply.status(404).send({
          error: 'Authentication failed',
          message: 'Invalid NPP or password'
        })
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return reply.status(404).send({
          error: 'Authentication failed',
          message: 'Invalid NPP or password'
        })
      }

      // Generate JWT token with embedded permissions
      const token = await this.fastify.generateToken(user.id)

      // Return user data and token
      return this.sendResponse(reply, {
        user: {
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
      const { 
        npp, 
        name, 
        email, 
        password, 
        photo,
        is_superuser = false,
        groups = [],
        permissions = []
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

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Use transaction to ensure all operations succeed or fail together
      const result = await this.prisma.$transaction(async (tx) => {
        // Create new user
        const newUser = await tx.personnels.create({
          data: {
            npp,
            name,
            email,
            password: hashedPassword,
            photo,
            is_superuser
          }
        })

        // Assign user to groups if provided
        if (groups.length > 0) {
          // Verify all groups exist
          const existingGroups = await tx.groups.findMany({
            where: { id: { in: groups } },
            select: { id: true }
          })

          if (existingGroups.length !== groups.length) {
            throw new Error('One or more group IDs are invalid')
          }

          // Create group assignments
          await Promise.all(groups.map(group_id => 
            tx.personnelGroups.create({
              data: {
                personnel_id: newUser.npp,
                group_id: group_id
              }
            })
          ))
        }

        // Add direct permissions if provided
        if (permissions.length > 0) {
          await Promise.all(permissions.map(perm =>
            tx.personnelPermissions.create({
              data: {
                personnel_id: newUser.npp,
                resource: perm.resource,
                permission: perm.permission
              }
            })
          ))
        }

        // Return created user with relations
        return tx.personnels.findUnique({
          where: { npp: newUser.npp },
          include: {
            PersonnelGroups: {
              include: {
                group: true
              }
            },
            PersonnelPermissions: true
          }
        })
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = result!

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

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { ActivityType, Prisma } from '@prisma/client'

// Helper function to determine activity type based on HTTP method and URL
function determineActivityType(method: string, url: string): ActivityType {
  // Login/logout specific detection
  if (url.includes('/auth/login')) return 'LOGIN';
  if (url.includes('/auth/logout')) return 'LOGOUT';

  // CRUD operations based on method
  switch (method) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'OTHER';
  }
}

// Extract a meaningful description from the request
function generateDescription(request: FastifyRequest): string {
  const method = request.method;
  const url = request.url;
  
  // Extract resource type from URL (very basic implementation)
  const urlParts = url.split('/').filter(Boolean);
  const resource = urlParts.length > 0 ? urlParts[0] : 'unknown';
  
  // Create a description based on the activity
  const activityType = determineActivityType(method, url);
  
  switch (activityType) {
    case 'LOGIN':
      return 'User login attempt';
    case 'LOGOUT':
      return 'User logout';
    case 'READ':
      return `Viewed ${resource}${urlParts.length > 1 ? ' details' : ' list'}`;
    case 'CREATE':
      return `Created new ${resource}`;
    case 'UPDATE':
      return `Updated ${resource}`;
    case 'DELETE':
      return `Deleted ${resource}`;
    default:
      return `${method} ${url}`;
  }
}

// Main middleware plugin
const activityLoggerMiddleware = fp(async (fastify: FastifyInstance) => {
  
  // Log detailed information about requests
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip logging for some endpoints if desired
    if (
      request.url.startsWith('/docs') ||
      request.url.startsWith('/health') ||
      request.url === '/favicon.ico'
    ) {
      return;
    }
    
    // We need to create a copy of the payload since request.body 
    // might not be parsed yet at this stage
    request.body; // This will trigger body parsing
  });
  
  // Use onResponse to log the final result including status code
  fastify.addHook('onResponse', async (request, reply) => {
    // Skip logging for some endpoints
    if (
      request.url.startsWith('/docs') ||
      request.url.startsWith('/health') ||
      request.url === '/favicon.ico'
    ) {
      return;
    }
    
    try {
      const user = request.user;
      const method = request.method;
      const url = request.url;
      const statusCode = reply.statusCode;
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'] || undefined;
      
      // Determine activity type and generate description
      const activityType = determineActivityType(method, url);
      const description = generateDescription(request);
      
      // Safely convert request.body to JSON object if it exists
      let payload = null;
      if (request.body && typeof request.body === 'object') {
        // Create a sanitized copy to avoid circular references and sensitive data
        const sanitizedPayload: { [key: string]: any } = { ...request.body };
        
        // Remove sensitive fields
        if (sanitizedPayload.password) sanitizedPayload.password = '***REDACTED***';
        if (sanitizedPayload.token) sanitizedPayload.token = '***REDACTED***';
        
        payload = sanitizedPayload;
      }
      
      // Create the activity log
      // await fastify.prisma.activityLogs.create({
      //   data: {
      //     personnel_id: user?.npp || null,
      //     url,
      //     method,
      //     description,
      //     ip_address: ipAddress,
      //     user_agent: userAgent,
      //     payload: payload ? JSON.stringify(payload) : Prisma.JsonNull,
      //     status_code: statusCode,
      //     activity_type: activityType,
      //   }
      // });
      
    } catch (error) {
      fastify.log.error(`Failed to log activity: ${error}`);
    }
  });
  
});

export default activityLoggerMiddleware;

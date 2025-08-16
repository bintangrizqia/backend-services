import 'fastify';

declare module 'fastify' {
  interface FastifyUser {
    npp: string;
    eselon?: number;
    is_superuser?: boolean;
    email?: string;
    name?: string;
  }

  interface FastifyRequest {
    user?: FastifyUser;
    permissions?: Record<string, string[]>; 
    permissionError?: boolean; 
  }
}

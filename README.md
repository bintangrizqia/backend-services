# PMP Backend Services

A RESTful API backend service built with Fastify and Prisma to manage personnel data with JWT authentication.

## Technologies Used

- **Fastify v5**: High-performance web framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Modern ORM for database access
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **Jest**: Testing framework

## Project Structure

```
/backend-services/
├── prisma/                  # Prisma schema and migrations
│   └── schema.prisma        # Database schema definition
├── src/
│   ├── controllers/         # Business logic controllers
│   ├── middleware/          # Custom middleware
│   ├── plugins/             # Fastify plugins
│   ├── routes/              # API routes
│   ├── app.ts               # Application setup
│   └── server.ts            # Server entry point
├── tests/                   # Test files
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend-services
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/pmp_database?schema=public"
   PORT=3000
   HOST=127.0.0.1
   NODE_ENV=development
   JWT_SECRET="your-secret-key-change-this-in-production"
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will be available at http://127.0.0.1:3000 with hot reloading enabled.

### Production Build

```bash
npm run build
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
http://127.0.0.1:3000/docs

### Available Endpoints

#### Authentication

- `POST /auth/login` - Authenticate user with NPP and password
- `POST /auth/register` - Register a new user
- `GET /auth/me` - Get current authenticated user info

#### Personnel Management

- `GET /personnels` - Get all personnel (with pagination and search)
- `GET /personnels/:id` - Get personnel by ID
- `POST /personnels` - Create new personnel
- `PUT /personnels/:id` - Update personnel
- `DELETE /personnels/:id` - Delete personnel

#### Utility Endpoints

- `GET /health` - Check API health status
- `GET /test` - Test endpoint
- `GET /routes` - List all registered routes

## Authentication

Most API endpoints require authentication. To authenticate:

1. Get a JWT token by calling the `/auth/login` endpoint
2. Include the token in subsequent requests as a Bearer token:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Example Requests

### Login

```bash
curl -X POST http://127.0.0.1:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"npp": "12345", "password": "your-password"}'
```

Response:
```json
{
  "user": {
    "id": "user-id",
    "npp": "12345",
    "name": "User Name",
    "email": "user@example.com"
  },
  "token": "your.jwt.token"
}
```

### Get Personnel List

```bash
curl -X GET http://127.0.0.1:3000/personnels?page=1&limit=10 \
  -H "Authorization: Bearer your.jwt.token"
```

## Error Handling

The API uses standard HTTP status codes and provides consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Database Schema

The main entities in the database are:

- **Personnels**: Users/employees with authentication capabilities

## Development

### Adding Routes

1. Create a new route file in the `src/routes/` directory
2. Define your routes using the Fastify API
3. Register your routes in `src/routes/index.ts`

### Creating Controllers

1. Add a new controller file in `src/controllers/`
2. Extend the BaseController class
3. Implement your controller methods

## Utility Scripts

### Creating Dummy Users

To create dummy test users in the database, run:

```bash
npm run create-users
```

This will create several test users with predefined credentials that you can use for testing.

## License

ISC

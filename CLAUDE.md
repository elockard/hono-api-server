# Hono Workplan - Modern Web API with Better-Auth & Drizzle

A production-ready Hono.js application with Better-Auth authentication, Drizzle ORM, PostgreSQL, and OpenAPI documentation using Stoker utilities.

## Tech Stack

- **Framework**: Hono.js with Node.js runtime
- **Authentication**: Better-Auth with email/password
- **Database**: PostgreSQL with Drizzle ORM
- **API Documentation**: OpenAPI 3.0 with Scalar API Reference
- **Validation**: Zod with type-safe schemas
- **Utilities**: Stoker for HTTP status codes and OpenAPI helpers
- **Package Manager**: pnpm

## Project Structure

```
src/
├── auth/           # Better-Auth configuration
├── db/             # Database connection, schema, migrations
│   └── schema/     # Database schemas organized by feature
│       ├── auth.ts     # Better-Auth tables
│       ├── tasks.ts    # Tasks tables with Zod schemas
│       └── index.ts    # Schema exports
├── lib/            # Utilities, types, app creation
│   ├── configure-open-api.ts  # OpenAPI documentation setup
│   ├── create-app.ts          # Application factory
│   ├── types.ts               # Type definitions
│   └── constants.ts           # Application constants
├── middleware/     # Custom middleware
│   └── pino-logger.ts  # Structured logging with pino
├── routes/         # Feature-based route organization
│   ├── index.routes.ts # API index route
│   └── {endpoint}/ # Each endpoint has its own folder
│       ├── {endpoint}.handlers.ts  # Route handler implementations
│       ├── {endpoint}.routes.ts    # OpenAPI route definitions
│       └── {endpoint}.index.ts     # Router assembly
└── index.ts        # Main application entry point
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up the database**:
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Apply migrations
   pnpm db:migrate
   ```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Database management
pnpm db:studio      # Open Drizzle Studio
pnpm db:generate    # Generate new migrations
pnpm db:migrate     # Apply migrations

# Better-Auth schema generation
pnpm auth:generate  # Generate auth schema
```

### Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## API Documentation

- **OpenAPI Spec**: `GET /doc`
- **API Reference**: `GET /reference` - Scalar API reference with Kepler theme
- **LLM Documentation**: `GET /llms` - Scalar interface for LLM consumption
- **LLMs.txt**: `GET /llms.txt` - Plain text markdown format for LLM training/context
- **API Base**: `/api`
- **API Index**: `GET /api/` - Returns API information

### Authentication Endpoints

Better-Auth provides the following endpoints:

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

### Example Endpoints

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get a specific task
- `PATCH /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

## Route Architecture

Each endpoint follows a consistent pattern:

### `{endpoint}.routes.ts`
Defines OpenAPI route specifications using Stoker helpers:
```typescript
export const create = createRoute({
  path: "/tasks",
  method: "post",
  request: {
    body: jsonContentRequired(insertTasksSchema, "The task to create"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectTasksSchema, "The created task"),
  },
});
```

### `{endpoint}.handlers.ts`
Implements the actual route logic with type safety:
```typescript
export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const task = c.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};
```

### `{endpoint}.index.ts`
Assembles routes and handlers into a router:
```typescript
const router = createRouter()
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne);
```

## Database Schema Organization

Schemas are organized in `/src/db/schema/` by feature:

### `/src/db/schema/auth.ts` - Authentication Tables
Better-Auth tables for user management:
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification

### `/src/db/schema/tasks.ts` - Application Tables
Application-specific tables with Zod schemas:
- `tasks` - Example task management with validation schemas

### `/src/db/schema/index.ts` - Schema Exports
Central export file for all schemas to maintain clean imports.

## Authentication Flow

1. **Session Middleware**: Automatically injects user/session into context
2. **Protected Routes**: Access `c.get("user")` and `c.get("session")`
3. **CORS Configuration**: Proper setup for cross-origin auth requests

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm auth:generate` | Generate Better-Auth schema |

## Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=hono_workplan
DATABASE_SSL=false

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Application
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Key Features

- **Type Safety**: End-to-end TypeScript with Zod validation
- **OpenAPI**: Auto-generated documentation with Scalar API Reference
- **LLM-Friendly**: Automatic markdown documentation generation at `/llms.txt` for AI consumption
- **Authentication**: Production-ready auth with Better-Auth
- **Database**: Modern ORM with migrations and type safety
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **CORS**: Properly configured for authentication flows
- **Development**: Hot reload and database studio
- **Production Ready**: Built-in middleware for logging, CORS, and error handling
- **Schema Organization**: Modular schema structure organized by feature

## Adding New Endpoints

1. Create a new folder in `src/routes/{endpoint}/`
2. Add `{endpoint}.routes.ts` with OpenAPI definitions
3. Add `{endpoint}.handlers.ts` with implementation
4. Add `{endpoint}.index.ts` to assemble the router
5. Mount the router in `src/index.ts`

Example:
```typescript
// src/index.ts
import usersRouter from "@/routes/users/users.index";
app.route("/api", usersRouter);
```

## Adding New Database Tables

1. Create schema in `src/db/schema/{feature}.ts`
2. Export from `src/db/schema/index.ts`
3. Generate migrations with `pnpm db:generate`
4. Apply migrations with `pnpm db:migrate`

Example:
```typescript
// src/db/schema/users.ts
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  // ... other fields
});

// Export Zod schemas
export const selectProfilesSchema = createSelectSchema(profiles);
export const insertProfilesSchema = createInsertSchema(profiles).omit({
  id: true,
});
```
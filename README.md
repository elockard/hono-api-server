# Hono Workplan

A production-ready web API built with Hono.js, featuring Better-Auth authentication, Drizzle ORM, PostgreSQL, and comprehensive OpenAPI documentation.

## ✨ Features

- **🚀 High Performance**: Built on Hono.js with Node.js runtime
- **🔐 Authentication**: Production-ready auth with Better-Auth (email/password)
- **📊 Database**: PostgreSQL with Drizzle ORM and type-safe migrations
- **📚 API Documentation**: Auto-generated OpenAPI 3.0 with Scalar API Reference
- **🛡️ Type Safety**: End-to-end TypeScript with Zod validation
- **🤖 LLM-Friendly**: Automatic markdown documentation for AI consumption
- **🔧 Developer Experience**: Hot reload, database studio, and structured logging

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Hono.js |
| Runtime | Node.js |
| Authentication | Better-Auth |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Documentation | OpenAPI 3.0 + Scalar |
| Package Manager | pnpm |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hono-workplan
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```bash
   # Database
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hono_workplan

   # Better-Auth
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000

   # Application
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Set up the database**:
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Apply migrations
   pnpm db:migrate
   
   # Generate auth schema
   pnpm auth:generate
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

Your API will be available at `http://localhost:3000`

## 📖 API Documentation

Once running, access the documentation at:

- **API Reference**: `http://localhost:3000/reference` - Interactive Scalar documentation
- **OpenAPI Spec**: `http://localhost:3000/doc` - Raw OpenAPI JSON
- **LLM Documentation**: `http://localhost:3000/llms` - AI-friendly interface
- **LLMs.txt**: `http://localhost:3000/llms.txt` - Markdown format for LLM training

## 🔐 Authentication

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up` | User registration |
| POST | `/api/auth/sign-in` | User login |
| POST | `/api/auth/sign-out` | User logout |
| GET | `/api/auth/session` | Get current session |

### Example Usage

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## 🗂️ Project Structure

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

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm auth:generate` | Generate Better-Auth schema |

## 🏗️ Adding New Endpoints

Follow this pattern to add new endpoints:

1. **Create endpoint folder**:
   ```bash
   mkdir src/routes/users
   ```

2. **Create route definitions** (`users.routes.ts`):
   ```typescript
   import { createRoute } from "@hono/zod-openapi";
   import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
   import { HttpStatusCodes } from "stoker/http-status-codes";

   export const create = createRoute({
     path: "/users",
     method: "post",
     request: {
       body: jsonContentRequired(insertUsersSchema, "The user to create"),
     },
     responses: {
       [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "The created user"),
     },
   });
   ```

3. **Create handlers** (`users.handlers.ts`):
   ```typescript
   import type { AppRouteHandler } from "@/lib/types";
   import type { CreateRoute } from "./users.routes";

   export const create: AppRouteHandler<CreateRoute> = async (c) => {
     const user = c.req.valid("json");
     // Implementation here
     return c.json(result, HttpStatusCodes.OK);
   };
   ```

4. **Assemble router** (`users.index.ts`):
   ```typescript
   import { createRouter } from "@/lib/create-app";
   import * as handlers from "./users.handlers";
   import * as routes from "./users.routes";

   const router = createRouter()
     .openapi(routes.create, handlers.create);

   export default router;
   ```

5. **Register in main app** (`src/index.ts`):
   ```typescript
   import usersRouter from "@/routes/users/users.index";

   const routes = [
     indexRouter,
     tasksRouter,
     usersRouter, // Add your new router
   ] as const;
   ```

## 🗄️ Database Schema Management

### Adding New Tables

1. **Create schema file**:
   ```typescript
   // src/db/schema/users.ts
   import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
   import { createInsertSchema, createSelectSchema } from "drizzle-zod";

   export const users = pgTable("users", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     email: text("email").notNull().unique(),
     createdAt: timestamp("created_at").defaultNow(),
   });

   export const selectUsersSchema = createSelectSchema(users);
   export const insertUsersSchema = createInsertSchema(users).omit({
     id: true,
     createdAt: true,
   });
   ```

2. **Export from index**:
   ```typescript
   // src/db/schema/index.ts
   export * from "./users";
   ```

3. **Generate and apply migrations**:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

## 🚀 Deployment

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production

Ensure these are set in your production environment:

- `DATABASE_URL` - Production database connection string
- `BETTER_AUTH_SECRET` - Strong secret key
- `BETTER_AUTH_URL` - Your production URL
- `NODE_ENV=production`
- `LOG_LEVEL=warn` or `error`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) - Fast, lightweight web framework
- [Better-Auth](https://www.better-auth.com/) - Authentication library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Scalar](https://scalar.com/) - API documentation
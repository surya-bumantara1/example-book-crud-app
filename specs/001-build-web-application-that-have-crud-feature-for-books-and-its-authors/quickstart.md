# Quickstart Guide: Book and Author Management System

## Prerequisites

- Node.js 20+ and npm/yarn
- Docker and Docker Compose
- Git

## Project Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd book-author-management-system
npm install
```

### 2. Environment Configuration

Copy environment files and configure:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/book_author_db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Application URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"

# Optional: Email service (for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

### 3. Database Setup

```bash
# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Optional: Seed database with sample data
npm run db:seed
```

### 4. Development Mode

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or run services individually:
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs (Swagger UI)

## Development Workflow

### Project Structure

```
├── backend/                 # Hono.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── models/         # Database models
│   ├── tests/              # Backend tests
│   └── prisma/             # Database schema
├── frontend/               # Nuxt.js application
│   ├── src/
│   │   ├── pages/          # File-based routing
│   │   ├── components/     # Vue components
│   │   ├── composables/    # State management
│   │   └── services/       # API clients
│   └── tests/              # Frontend tests
└── docker-compose.yml      # Container orchestration
```

### Key Development Commands

```bash
# Database
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Run database migrations
npm run db:seed             # Seed with sample data
npm run db:studio           # Open Prisma Studio

# Testing
npm run test:backend        # Run backend tests
npm run test:frontend       # Run frontend tests
npm run test:e2e           # Run end-to-end tests

# Development
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run dev                # Start both (if configured)

# Production
npm run build              # Build for production
npm run start              # Start production server
```

### Code Quality Tools

```bash
# Linting
npm run lint:backend       # Lint backend code
npm run lint:frontend      # Lint frontend code

# Formatting
npm run format:backend     # Format backend code
npm run format:frontend    # Format frontend code

# Type checking
npm run typecheck:backend  # TypeScript check backend
npm run typecheck:frontend # TypeScript check frontend
```

## API Usage Examples

### Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"author@example.com","password":"password123"}'

# Use token in subsequent requests
curl -X GET http://localhost:8000/api/authors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Authors

```bash
# Create author
curl -X POST http://localhost:8000/api/authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "bio": "A passionate writer",
    "email": "john@example.com"
  }'

# Get all authors
curl http://localhost:8000/api/authors

# Update author
curl -X PUT http://localhost:8000/api/authors/AUTHOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Jane Smith"}'
```

### Books

```bash
# Create book
curl -X POST http://localhost:8000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Great Book",
    "description": "An amazing story",
    "primaryAuthorId": "AUTHOR_ID"
  }'

# Add co-author
curl -X PUT http://localhost:8000/api/books/BOOK_ID/co-author \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"coAuthorId": "CO_AUTHOR_ID"}'

# Transfer authorship
curl -X PUT http://localhost:8000/api/books/BOOK_ID/transfer-authorship \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"newPrimaryAuthorId": "NEW_AUTHOR_ID"}'
```

## Docker Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

### Database Management

```bash
# Access PostgreSQL container
docker-compose exec postgres psql -U postgres -d book_author_db

# Run migrations in container
docker-compose exec backend npm run db:migrate

# Reset database (development only)
docker-compose down -v  # Remove volumes
docker-compose up -d     # Recreate with fresh database
```

## Testing

### Running Tests

```bash
# All tests
npm run test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# E2E tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

### Test Database

Tests use a separate test database to avoid affecting development data:

```bash
# Setup test database
npm run db:test:setup

# Run tests with test database
npm run test:backend
```

## Deployment

### Production Build

```bash
# Build frontend for production
npm run build:frontend

# Build backend for production
npm run build:backend

# Or build everything
npm run build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check DATABASE_URL configuration
   - Verify database exists: `npm run db:migrate`

2. **Authentication issues**
   - Check JWT_SECRET is set in environment
   - Verify token format in requests
   - Check user exists in database

3. **Port conflicts**
   - Frontend (3000), Backend (8000), Database (5432)
   - Update docker-compose.yml ports if needed

### Development Tips

- Use browser developer tools to inspect API calls
- Check application logs: `docker-compose logs -f [service-name]`
- Use Prisma Studio for database inspection: `npm run db:studio`
- Hot reload is enabled for both frontend and backend

## Next Steps

After setup, you can:

1. **Explore the API**: Visit http://localhost:8000/api/docs for interactive API documentation
2. **View the application**: Navigate to http://localhost:3000 to see the frontend
3. **Start developing**: Follow the development workflow for new features
4. **Run tests**: Ensure everything works with `npm run test`

## Support

For issues and questions:
- Check the troubleshooting section above
- Review application logs for error details
- Consult the API documentation for endpoint details
- Check the project repository for updates and issues

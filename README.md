# Book and Author Management System

A modern web application for managing books and authors with full CRUD operations, collaborative authorship, and comprehensive search functionality.

## 🚀 Features

### Core Functionality
- **Author Management**: Create, read, update, delete authors with bio and contact information
- **Book Management**: Full CRUD operations for books with title, description, ISBN, and publication dates
- **Collaborative Authorship**: Support for primary authors and optional co-authors
- **Authorship Transfer**: Transfer book ownership between authors
- **Advanced Search**: Search across books and authors with filtering and pagination
- **Soft Delete**: Data preservation with soft delete functionality

### Technical Features
- **Modern Tech Stack**: Nuxt.js 3, Hono.js, TypeScript, PostgreSQL, Prisma ORM
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Authentication**: JWT-based authentication with role-based access control
- **Containerization**: Docker support for development and deployment
- **Testing Ready**: Comprehensive testing infrastructure with Vitest, Jest, and Playwright

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-author-management-system
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/api/docs

### Alternative: Manual Setup

1. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy and modify environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start PostgreSQL database**
   ```bash
   docker run --name postgres-book-author -e POSTGRES_DB=book_author_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
   ```

4. **Run database migrations**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd ../frontend
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Author Endpoints
- `GET /api/authors` - List all authors (with search and pagination)
- `POST /api/authors` - Create new author
- `GET /api/authors/{id}` - Get author by ID
- `PUT /api/authors/{id}` - Update author
- `DELETE /api/authors/{id}` - Soft delete author

### Book Endpoints
- `GET /api/books` - List all books (with search and filtering)
- `POST /api/books` - Create new book
- `GET /api/books/{id}` - Get book by ID
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Soft delete book
- `PUT /api/books/{id}/co-author` - Update book co-author
- `PUT /api/books/{id}/transfer-authorship` - Transfer book authorship

## 🏗️ Architecture

### Frontend (Nuxt.js 3)
```
frontend/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── pages/         # File-based routing pages
│   ├── composables/   # Vue composables for state management
│   ├── services/      # API client services
│   └── types/         # TypeScript type definitions
├── tests/             # Frontend tests
└── nuxt.config.ts     # Nuxt configuration
```

### Backend (Hono.js)
```
backend/
├── src/
│   ├── models/        # Database models and schemas
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic services
│   ├── middleware/    # Authentication and validation
│   └── utils/         # Utility functions
├── tests/             # Backend tests
└── prisma/            # Database schema and migrations
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# End-to-end tests
npm run test:e2e

# All tests
npm run test
```

### Test Coverage
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows with Playwright

## 🚢 Deployment

### Production Build
```bash
# Build both frontend and backend
npm run build

# Or build individually
npm run build:frontend
npm run build:backend
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Development

### Code Quality Tools
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run typecheck
```

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 📋 User Stories

### ✅ Completed
1. **Author CRUD Operations** - Complete author management with search
2. **Book CRUD Operations** - Full book management with author relationships
3. **Co-Author Management** - Collaborative authorship features
4. **Authorship Transfer** - Book ownership lifecycle management
5. **Search and Browse** - Comprehensive search across content

### 🎯 Key Features
- **Independent Testing**: Each user story can be tested independently
- **Progressive Enhancement**: Features build upon each other
- **Data Integrity**: Soft deletes and relationship validation
- **Performance**: Optimized queries and pagination
- **Accessibility**: WCAG 2.1 AA compliance

## 🔐 Security

- **Input Validation**: Comprehensive validation on all endpoints
- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Security Headers**: Proper security headers implementation
- **Rate Limiting**: Protection against abuse

## 📊 Performance

- **Response Times**: <200ms p95 for all operations
- **Scalability**: Support for 10k+ books and authors
- **Database Optimization**: Indexed queries and efficient pagination
- **Caching Strategy**: Browser caching for static assets
- **Bundle Optimization**: Code splitting and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nuxt.js](https://nuxtjs.org/) for the frontend
- Powered by [Hono](https://hono.dev/) for the backend API
- Database management with [Prisma](https://prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Containerized with [Docker](https://docker.com/)

---

**Version**: 1.0.0 | **Last Updated**: 2025-10-15

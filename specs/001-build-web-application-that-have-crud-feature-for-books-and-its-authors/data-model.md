# Data Model: Book and Author Management System

## Overview

This document defines the data model for the book and author management system, including entity relationships, field specifications, and validation rules derived from the feature specification.

## Core Entities

### Author Entity

**Purpose**: Represents individuals who can author books and participate in collaborative authorship.

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the author
- `name`: String (Required, 2-100 chars) - Full name of the author
- `bio`: Text (Optional, max 2000 chars) - Biography or description of the author
- `email`: String (Optional, unique) - Contact email for the author
- `createdAt`: DateTime - Record creation timestamp
- `updatedAt`: DateTime - Last modification timestamp
- `deletedAt`: DateTime (Nullable) - Soft delete timestamp

**Relationships**:
- One-to-many with Book (as primary author)
- One-to-many with Book (as co-author, optional)

**Validation Rules**:
- Name must be between 2-100 characters
- Email must be valid format if provided
- Bio must not exceed 2000 characters

**Indexes**:
- Unique index on email (for authors who provide email)
- Index on name for search functionality

### Book Entity

**Purpose**: Represents written works that can have primary and optional co-authors.

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the book
- `title`: String (Required, 1-200 chars) - Title of the book
- `description`: Text (Optional, max 5000 chars) - Description or summary of the book
- `isbn`: String (Optional, unique) - ISBN number for the book
- `publishedDate`: DateTime (Optional) - Publication date of the book
- `primaryAuthorId`: UUID (Required, Foreign Key) - Reference to the primary author
- `coAuthorId`: UUID (Optional, Foreign Key) - Reference to the co-author (if any)
- `createdAt`: DateTime - Record creation timestamp
- `updatedAt`: DateTime - Last modification timestamp
- `deletedAt`: DateTime (Nullable) - Soft delete timestamp

**Relationships**:
- Many-to-one with Author (primary author, required)
- One-to-one with Author (co-author, optional)

**Validation Rules**:
- Title must be between 1-200 characters
- Description must not exceed 5000 characters
- ISBN must be valid format if provided (ISBN-10 or ISBN-13)
- Primary author must exist and not be soft deleted
- Co-author must exist and not be soft deleted (if provided)
- Primary author and co-author must be different people

**Business Rules**:
- A book cannot have the same person as both primary author and co-author
- When transferring authorship, the previous primary author loses primary rights
- Co-authors retain access to books even after authorship transfers

**Indexes**:
- Index on title for search functionality
- Index on primaryAuthorId for filtering books by author
- Unique index on isbn (for books with ISBN)
- Composite index on (primaryAuthorId, createdAt) for author book listings

## Entity Relationships

### Author ↔ Book Relationships

```
Author (1) ─────────────── (many) Book (as primary author)
   │
   │ (optional)
   │
   └── (many) Book (as co-author)
```

**Relationship Constraints**:
- Every book must have exactly one primary author
- A book may have 0 or 1 co-author
- An author can be primary author of many books
- An author can be co-author of many books
- An author cannot be both primary author and co-author of the same book

### Data Integrity Rules

**Referential Integrity**:
- If an author is soft deleted, their books remain but cannot be accessed by active users
- Primary author relationship cannot reference a soft-deleted author
- Co-author relationship cannot reference a soft-deleted author (if present)

**Cascade Behaviors**:
- Soft delete of author: Books remain but become inaccessible
- Hard delete of author: Not allowed if they have books (business rule)
- Transfer of authorship: Updates primaryAuthorId reference

## State Transitions

### Author States
- **Active**: `deletedAt` is null
- **Soft Deleted**: `deletedAt` is set, record preserved

### Book States
- **Active**: `deletedAt` is null
- **Soft Deleted**: `deletedAt` is set, record preserved

**Allowed Transitions**:
- Active → Soft Deleted (by primary author or admin)
- Soft Deleted → Active (restore operation)

## Database Schema (Prisma)

```prisma
model Author {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(100)
  bio       String?  @db.Text
  email     String?  @unique @db.VarChar(255)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relationships
  primaryBooks Book[] @relation("PrimaryAuthorship")
  coAuthored   Book[] @relation("CoAuthorship")

  @@map("authors")
}

model Book {
  id             String   @id @default(cuid())
  title          String   @db.VarChar(200)
  description    String?  @db.Text
  isbn           String?  @unique @db.VarChar(17)
  publishedDate  DateTime?
  primaryAuthorId String
  coAuthorId     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  // Relationships
  primaryAuthor Author @relation("PrimaryAuthorship", fields: [primaryAuthorId], references: [id])
  coAuthor      Author? @relation("CoAuthorship", fields: [coAuthorId], references: [id])

  @@map("books")
}
```

## Validation Middleware

The data model includes validation middleware for:
- Ensuring primary author exists and is not soft deleted
- Ensuring co-author exists and is not soft deleted (if provided)
- Preventing self-co-authorship (primary author ≠ co-author)
- Enforcing string length limits and format validation

## Migration Strategy

- Use Prisma migrations for schema versioning
- Implement zero-downtime migrations where possible
- Include data migration scripts for authorship transfers
- Test migrations thoroughly before deployment

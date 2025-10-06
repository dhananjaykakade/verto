# Quiz Backend API

A production-grade quiz application backend built with Node.js, TypeScript, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **Quiz Management**: Create, read, update, and delete quizzes
- **Question Management**: Support for multiple question types:
  - Single Choice (radio buttons)
  - Multiple Choice (checkboxes)
  - Text-based questions (with word limit validation)
- **Quiz Taking**: Fetch questions and submit answers with automatic scoring
- **Comprehensive Validation**: Input validation with Zod schemas
- **Production-Ready Error Handling**: Structured error responses and logging
- **Database**: PostgreSQL with Prisma ORM and cascade deletes
- **Testing**: Comprehensive unit tests with Jest and Supertest
- **Logging**: Structured logging with Pino
- **Docker**: Docker Compose setup for PostgreSQL

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Jest + Supertest + ts-jest
- **Logging**: Pino with pretty printing
- **Package Manager**: pnpm
- **Containerization**: Docker Compose

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Docker and Docker Compose

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Run database migrations
pnpm prisma:migrate

# Generate Prisma client
pnpm prisma:generate
```

### 3. Environment Configuration

The application uses the following environment variables (already configured in `.env`):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://quizuser:quizpass@localhost:8080/quizdb
LOG_PRETTY=true
```

### 4. Start the Application

```bash
# Development mode with hot reload
pnpm dev

# Production build and start
pnpm build
pnpm start
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Health Check
```http
GET /health
```

### Quiz Management

#### Create Quiz
```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "JavaScript Fundamentals"
}
```

#### Get All Quizzes
```http
GET /api/quizzes
```

#### Get Quiz by ID
```http
GET /api/quizzes/{quizId}
```

#### Update Quiz
```http
PUT /api/quizzes/{quizId}
Content-Type: application/json

{
  "title": "Updated Quiz Title"
}
```

#### Delete Quiz
```http
DELETE /api/quizzes/{quizId}
```

### Question Management

#### Add Question to Quiz
```http
POST /api/quizzes/{quizId}/questions
Content-Type: application/json
```

**Single Choice Question:**
```json
{
  "text": "What is the correct way to declare a variable in JavaScript?",
  "type": "SINGLE_CHOICE",
  "options": [
    { "text": "var x = 5;", "isCorrect": true },
    { "text": "variable x = 5;", "isCorrect": false },
    { "text": "v x = 5;", "isCorrect": false }
  ]
}
```

**Multiple Choice Question:**
```json
{
  "text": "Which of the following are JavaScript frameworks?",
  "type": "MULTIPLE_CHOICE",
  "options": [
    { "text": "React", "isCorrect": true },
    { "text": "Vue", "isCorrect": true },
    { "text": "HTML", "isCorrect": false },
    { "text": "Angular", "isCorrect": true }
  ]
}
```

**Text Question:**
```json
{
  "text": "What does 'DOM' stand for?",
  "type": "TEXT",
  "options": [
    { "text": "Document Object Model", "isCorrect": true }
  ]
}
```

#### Get Questions for Quiz Taking (No Answers)
```http
GET /api/quizzes/{quizId}/questions
```

#### Get Questions with Answers (Admin)
```http
GET /api/quizzes/{quizId}/questions/admin
```

### Quiz Taking & Scoring

#### Submit Quiz Answers
```http
POST /api/quizzes/{quizId}/submit
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "uuid-1",
      "selectedOptionIds": ["option-uuid-1"]
    },
    {
      "questionId": "uuid-2",
      "selectedOptionIds": ["option-uuid-2", "option-uuid-3"]
    },
    {
      "questionId": "uuid-3",
      "textAnswer": "Document Object Model"
    }
  ]
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

## 🏗 Project Structure

```
src/
├── config/           # Configuration files
│   ├── env.ts       # Environment variables
│   └── logger.ts    # Pino logger setup
├── db/              # Database configuration
│   └── prisma.ts    # Prisma client setup
├── middleware/      # Express middleware
│   ├── errorHandler.ts
│   └── validation.ts
├── modules/         # Feature modules
│   ├── quiz/        # Quiz management
│   └── question/    # Question management
├── tests/           # Test files
├── utils/           # Utility functions
│   └── responseHandler.ts
├── validators/      # Zod validation schemas
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## 🔧 Available Scripts

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Build TypeScript to JavaScript
pnpm start            # Start production server
pnpm test             # Run test suite
pnpm prisma:migrate   # Run database migrations
pnpm prisma:generate  # Generate Prisma client
```


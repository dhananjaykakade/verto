import express from "express"
import quizRoutes from "./modules/quiz/quiz.routes.js";
import questionRoutes from "./modules/question/question.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./config/logger.js";

const app: express.Application = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    msg: 'Incoming request',
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Quiz API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/quizzes", questionRoutes); // Question routes are nested under quizzes
app.use("/api", questionRoutes); // Individual question management routes

// 404 handler - must be after all other routes
app.use((req, res) => {
  logger.warn({ msg: 'Route not found', url: req.originalUrl, method: req.method });
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;

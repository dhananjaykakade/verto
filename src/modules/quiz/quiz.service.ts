import { prisma } from "../../db/prisma.js";
import { StatusCodes } from "http-status-codes";
import { logger } from "../../config/logger.js";

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Create a new quiz
 */
export const createQuiz = async (title: string) => {
  logger.info({ msg: 'Creating quiz', title });
  
  const quiz = await prisma.quiz.create({ 
    data: { title },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  logger.info({ msg: 'Quiz created successfully', quizId: quiz.id });
  return quiz;
};

/**
 * Get all quizzes with basic information
 */
export const getAllQuizzes = async () => {
  logger.info({ msg: 'Fetching all quizzes' });
  
  const quizzes = await prisma.quiz.findMany({
    select: { 
      id: true, 
      title: true, 
      createdAt: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  logger.info({ msg: 'Quizzes fetched successfully', count: quizzes.length });
  return quizzes;
};

/**
 * Get a single quiz by ID with detailed information
 */
export const getQuizById = async (quizId: string) => {
  logger.info({ msg: 'Fetching quiz by ID', quizId });
  
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });
  
  if (!quiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }
  
  logger.info({ msg: 'Quiz fetched successfully', quizId });
  return quiz;
};

/**
 * Update a quiz
 */
export const updateQuiz = async (quizId: string, title: string) => {
  logger.info({ msg: 'Updating quiz', quizId, title });
  
  // Check if quiz exists
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });
  
  if (!existingQuiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }
  
  const quiz = await prisma.quiz.update({
    where: { id: quizId },
    data: { title },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  logger.info({ msg: 'Quiz updated successfully', quizId });
  return quiz;
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (quizId: string) => {
  logger.info({ msg: 'Deleting quiz', quizId });
  
  // Check if quiz exists
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });
  
  if (!existingQuiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }
  
  // Delete quiz (questions and options will be deleted due to cascade)
  await prisma.quiz.delete({
    where: { id: quizId },
  });
  
  logger.info({ msg: 'Quiz deleted successfully', quizId });
  return { message: 'Quiz deleted successfully' };
};

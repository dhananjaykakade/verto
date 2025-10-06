import { prisma } from '../../db/prisma.js';
import { StatusCodes } from 'http-status-codes';
import type { CreateQuestionInput, SubmitAnswersInput } from '../../validators/quiz.validator.js';
import { logger } from '../../config/logger.js';

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
 * Create a new question for a quiz
 */
export const createQuestion = async (quizId: string, questionData: CreateQuestionInput) => {
  logger.info({ msg: 'Creating question', quizId, questionData });

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }

  // Create question with options
  const question = await prisma.question.create({
    data: {
      text: questionData.text,
      type: questionData.type,
      quizId,
      options: {
        create: questionData.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      },
    },
    include: {
      options: true,
    },
  });

  logger.info({ msg: 'Question created successfully', questionId: question.id });
  return question;
};

/**
 * Get all questions for a quiz (for quiz taking - without correct answers)
 */
export const getQuizQuestions = async (quizId: string) => {
  logger.info({ msg: 'Fetching quiz questions', quizId });

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }

  // Get questions without revealing correct answers
  const questions = await prisma.question.findMany({
    where: { quizId },
    select: {
      id: true,
      text: true,
      type: true,
      options: {
        select: {
          id: true,
          text: true,
          // Explicitly exclude isCorrect field
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  logger.info({ msg: 'Quiz questions fetched successfully', quizId, questionCount: questions.length });
  return questions;
};

/**
 * Get all questions for a quiz (for admin/management - with correct answers)
 */
export const getQuizQuestionsWithAnswers = async (quizId: string) => {
  logger.info({ msg: 'Fetching quiz questions with answers', quizId });

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }

  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      options: true,
    },
    orderBy: { id: 'asc' },
  });

  logger.info({ msg: 'Quiz questions with answers fetched successfully', quizId, questionCount: questions.length });
  return questions;
};

/**
 * Submit answers for a quiz and calculate score
 */
export const submitQuizAnswers = async (quizId: string, answersData: SubmitAnswersInput) => {
  logger.info({ msg: 'Submitting quiz answers', quizId, answerCount: answersData.answers.length });

  // Verify quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError('Quiz not found', StatusCodes.NOT_FOUND);
  }

  // Get all questions with correct answers for this quiz
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      options: true,
    },
  });

  if (questions.length === 0) {
    throw new AppError('No questions found for this quiz', StatusCodes.BAD_REQUEST);
  }

  // Create a map for quick lookup
  const questionMap = new Map(questions.map(q => [q.id, q]));
  
  let correctAnswers = 0;
  const results: Array<{
    questionId: string;
    isCorrect: boolean;
    correctAnswer?: string | string[];
  }> = [];

  // Validate and score each answer
  for (const answer of answersData.answers) {
    const question = questionMap.get(answer.questionId);
    
    if (!question) {
      throw new AppError(`Question with ID ${answer.questionId} not found in this quiz`, StatusCodes.BAD_REQUEST);
    }

    let isCorrect = false;
    let correctAnswer: string | string[] = '';

    if (question.type === 'TEXT') {
      // For text questions, compare with the correct answer option
      const correctOption = question.options.find(opt => opt.isCorrect);
      if (correctOption && answer.textAnswer) {
        // Case-insensitive comparison, trimmed
        isCorrect = answer.textAnswer.trim().toLowerCase() === correctOption.text.trim().toLowerCase();
        correctAnswer = correctOption.text;
      }
    } else {
      // For choice questions
      const correctOptionIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
      
      const selectedIds = answer.selectedOptionIds || [];
      
      if (question.type === 'SINGLE_CHOICE') {
        // Single choice: exactly one correct option should be selected
        isCorrect = selectedIds.length === 1 && 
                   correctOptionIds.length === 1 && 
                   selectedIds[0] === correctOptionIds[0];
        correctAnswer = question.options.find(opt => opt.isCorrect)?.text || '';
      } else if (question.type === 'MULTIPLE_CHOICE') {
        // Multiple choice: all correct options should be selected, no incorrect ones
        const selectedSet = new Set(selectedIds);
        const correctSet = new Set(correctOptionIds);
        
        isCorrect = selectedSet.size === correctSet.size && 
                   [...selectedSet].every(id => correctSet.has(id));
        correctAnswer = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text);
      }
    }

    if (isCorrect) {
      correctAnswers++;
    }

    results.push({
      questionId: answer.questionId,
      isCorrect,
      correctAnswer,
    });
  }

  const score = {
    score: correctAnswers,
    total: questions.length,
    percentage: Math.round((correctAnswers / questions.length) * 100),
    results,
  };

  logger.info({ 
    msg: 'Quiz answers submitted and scored', 
    quizId, 
    score: correctAnswers, 
    total: questions.length,
    percentage: score.percentage 
  });

  return score;
};

/**
 * Get a single question by ID (for admin purposes)
 */
export const getQuestionById = async (questionId: string) => {
  logger.info({ msg: 'Fetching question by ID', questionId });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      options: true,
      quiz: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!question) {
    throw new AppError('Question not found', StatusCodes.NOT_FOUND);
  }

  logger.info({ msg: 'Question fetched successfully', questionId });
  return question;
};

/**
 * Update a question
 */
export const updateQuestion = async (questionId: string, questionData: CreateQuestionInput) => {
  logger.info({ msg: 'Updating question', questionId, questionData });

  // Verify question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });

  if (!existingQuestion) {
    throw new AppError('Question not found', StatusCodes.NOT_FOUND);
  }

  // Update question and replace options
  const question = await prisma.$transaction(async (tx) => {
    // Delete existing options
    await tx.option.deleteMany({
      where: { questionId },
    });

    // Update question and create new options
    return tx.question.update({
      where: { id: questionId },
      data: {
        text: questionData.text,
        type: questionData.type,
        options: {
          create: questionData.options.map(option => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        },
      },
      include: {
        options: true,
      },
    });
  });

  logger.info({ msg: 'Question updated successfully', questionId });
  return question;
};

/**
 * Delete a question
 */
export const deleteQuestion = async (questionId: string) => {
  logger.info({ msg: 'Deleting question', questionId });

  // Verify question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!existingQuestion) {
    throw new AppError('Question not found', StatusCodes.NOT_FOUND);
  }

  // Delete question (options will be deleted due to cascade)
  await prisma.question.delete({
    where: { id: questionId },
  });

  logger.info({ msg: 'Question deleted successfully', questionId });
  return { message: 'Question deleted successfully' };
};

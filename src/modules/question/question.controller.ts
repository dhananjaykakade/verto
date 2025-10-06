import type { Request, Response, NextFunction } from 'express';
import * as questionService from './question.service.js';
import { sendSuccess } from '../../utils/responseHandler.js';
import { logger } from '../../config/logger.js';

/**
 * Create a new question for a quiz
 * POST /api/quizzes/:quizId/questions
 */
export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params as { quizId: string };
    const questionData = req.body;

    logger.info({ msg: 'Creating question request', quizId, questionData });

    const question = await questionService.createQuestion(quizId, questionData);
    
    return sendSuccess(res, question, 'Question created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get all questions for a quiz (for quiz taking - without correct answers)
 * GET /api/quizzes/:quizId/questions
 */
export const getQuizQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params as { quizId: string };

    logger.info({ msg: 'Getting quiz questions request', quizId });

    const questions = await questionService.getQuizQuestions(quizId);
    
    return sendSuccess(res, questions, 'Quiz questions fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get all questions for a quiz with answers (for admin/management)
 * GET /api/quizzes/:quizId/questions/admin
 */
export const getQuizQuestionsWithAnswers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params as { quizId: string };

    logger.info({ msg: 'Getting quiz questions with answers request', quizId });

    const questions = await questionService.getQuizQuestionsWithAnswers(quizId);
    
    return sendSuccess(res, questions, 'Quiz questions with answers fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Submit answers for a quiz and get score
 * POST /api/quizzes/:quizId/submit
 */
export const submitQuizAnswers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params as { quizId: string };
    const answersData = req.body;

    logger.info({ msg: 'Submitting quiz answers request', quizId, answerCount: answersData.answers?.length });

    const result = await questionService.submitQuizAnswers(quizId, answersData);
    
    return sendSuccess(res, result, 'Quiz answers submitted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single question by ID (for admin purposes)
 * GET /api/questions/:questionId
 */
export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params as { questionId: string };

    logger.info({ msg: 'Getting question by ID request', questionId });

    const question = await questionService.getQuestionById(questionId);
    
    return sendSuccess(res, question, 'Question fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Update a question
 * PUT /api/questions/:questionId
 */
export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params as { questionId: string };
    const questionData = req.body;

    logger.info({ msg: 'Updating question request', questionId, questionData });

    const question = await questionService.updateQuestion(questionId, questionData);
    
    return sendSuccess(res, question, 'Question updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a question
 * DELETE /api/questions/:questionId
 */
export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params as { questionId: string };

    logger.info({ msg: 'Deleting question request', questionId });

    const result = await questionService.deleteQuestion(questionId);
    
    return sendSuccess(res, result, 'Question deleted successfully');
  } catch (err) {
    next(err);
  }
};

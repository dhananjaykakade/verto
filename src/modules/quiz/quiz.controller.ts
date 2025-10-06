import type { Request, Response, NextFunction } from "express";
import * as quizService from "./quiz.service.js";
import { sendSuccess } from "../../utils/responseHandler.js";
import { logger } from "../../config/logger.js";

/**
 * Create a new quiz
 * POST /api/quizzes
 */
export const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    
    logger.info({ msg: 'Creating quiz request', title });
    
    const quiz = await quizService.createQuiz(title);
    return sendSuccess(res, quiz, "Quiz created successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Get all quizzes
 * GET /api/quizzes
 */
export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info({ msg: 'Getting all quizzes request' });
    
    const quizzes = await quizService.getAllQuizzes();
    return sendSuccess(res, quizzes, "Quizzes fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single quiz by ID
 * GET /api/quizzes/:id
 */
export const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    
    logger.info({ msg: 'Getting quiz by ID request', quizId: id });
    
    const quiz = await quizService.getQuizById(id);
    return sendSuccess(res, quiz, "Quiz fetched successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Update a quiz
 * PUT /api/quizzes/:id
 */
export const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { title } = req.body;
    
    logger.info({ msg: 'Updating quiz request', quizId: id, title });
    
    const quiz = await quizService.updateQuiz(id, title);
    return sendSuccess(res, quiz, "Quiz updated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a quiz
 * DELETE /api/quizzes/:id
 */
export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    
    logger.info({ msg: 'Deleting quiz request', quizId: id });
    
    const result = await quizService.deleteQuiz(id);
    return sendSuccess(res, result, "Quiz deleted successfully");
  } catch (err) {
    next(err);
  }
};

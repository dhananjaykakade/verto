import { Router } from 'express';
import * as questionController from './question.controller.js';
import { validateBody, validateParams } from '../../middleware/validation.js';
import { 
  createQuestionSchema, 
  quizIdParamSchema, 
  questionIdSchema, 
  submitAnswersSchema 
} from '../../validators/quiz.validator.js';

const router: Router = Router();

/**
 * @route   POST /api/quizzes/:quizId/questions
 * @desc    Create a new question for a quiz
 * @access  Public (should be protected in production)
 * @body    { text: string, type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT', options: Array<{ text: string, isCorrect: boolean }> }
 */
router.post(
  '/:quizId/questions',
  validateParams(quizIdParamSchema),
  validateBody(createQuestionSchema),
  questionController.createQuestion
);

/**
 * @route   GET /api/quizzes/:quizId/questions
 * @desc    Get all questions for a quiz (for quiz taking - without correct answers)
 * @access  Public
 */
router.get(
  '/:quizId/questions',
  validateParams(quizIdParamSchema),
  questionController.getQuizQuestions
);

/**
 * @route   GET /api/quizzes/:quizId/questions/admin
 * @desc    Get all questions for a quiz with answers (for admin/management)
 * @access  Admin (should be protected in production)
 */
router.get(
  '/:quizId/questions/admin',
  validateParams(quizIdParamSchema),
  questionController.getQuizQuestionsWithAnswers
);

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    Submit answers for a quiz and get score
 * @access  Public
 * @body    { answers: Array<{ questionId: string, selectedOptionIds?: string[], textAnswer?: string }> }
 */
router.post(
  '/:quizId/submit',
  validateParams(quizIdParamSchema),
  validateBody(submitAnswersSchema),
  questionController.submitQuizAnswers
);

/**
 * Individual question management routes
 */

/**
 * @route   GET /api/questions/:questionId
 * @desc    Get a single question by ID (for admin purposes)
 * @access  Admin (should be protected in production)
 */
router.get(
  '/questions/:questionId',
  validateParams(questionIdSchema),
  questionController.getQuestionById
);

/**
 * @route   PUT /api/questions/:questionId
 * @desc    Update a question
 * @access  Admin (should be protected in production)
 * @body    { text: string, type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT', options: Array<{ text: string, isCorrect: boolean }> }
 */
router.put(
  '/questions/:questionId',
  validateParams(questionIdSchema),
  validateBody(createQuestionSchema),
  questionController.updateQuestion
);

/**
 * @route   DELETE /api/questions/:questionId
 * @desc    Delete a question
 * @access  Admin (should be protected in production)
 */
router.delete(
  '/questions/:questionId',
  validateParams(questionIdSchema),
  questionController.deleteQuestion
);

export default router;

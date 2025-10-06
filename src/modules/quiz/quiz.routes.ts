import { Router } from "express";
import * as quizController from "./quiz.controller.js";
import { validateBody, validateParams } from "../../middleware/validation.js";
import { createQuizSchema, quizIdSchema } from "../../validators/quiz.validator.js";

const router: Router = Router();

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Public (should be protected in production)
 * @body    { title: string }
 */
router.post("/", validateBody(createQuizSchema), quizController.createQuiz);

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes
 * @access  Public
 */
router.get("/", quizController.getQuizzes);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get a single quiz by ID
 * @access  Public
 */
router.get("/:id", validateParams(quizIdSchema), quizController.getQuizById);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update a quiz
 * @access  Admin (should be protected in production)
 * @body    { title: string }
 */
router.put("/:id", validateParams(quizIdSchema), validateBody(createQuizSchema), quizController.updateQuiz);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz
 * @access  Admin (should be protected in production)
 */
router.delete("/:id", validateParams(quizIdSchema), quizController.deleteQuiz);

export default router;

import { z } from 'zod';

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
});

export const quizIdSchema = z.object({
  id: z.string().uuid('Invalid quiz ID format'),
});

export const quizIdParamSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID format'),
});

// Question validation schemas
export const createQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(1000, 'Question text must be less than 1000 characters'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT'], {
    message: 'Question type must be SINGLE_CHOICE, MULTIPLE_CHOICE, or TEXT',
  }),
  options: z.array(
    z.object({
      text: z.string().min(1, 'Option text is required').max(500, 'Option text must be less than 500 characters'),
      isCorrect: z.boolean(),
    })
  ).min(1, 'At least one option is required'),
}).refine(
  (data) => {
    if (data.type === 'TEXT') {
      // For text questions, we expect exactly one option that serves as the correct answer
      return data.options.length === 1 && data.options[0] && data.options[0].text.length <= 300;
    }
    
    const correctOptions = data.options.filter(option => option.isCorrect);
    
    if (data.type === 'SINGLE_CHOICE') {
      return correctOptions.length === 1;
    }
    
    if (data.type === 'MULTIPLE_CHOICE') {
      return correctOptions.length >= 1;
    }
    
    return true;
  },
  {
    message: 'Invalid question configuration: SINGLE_CHOICE must have exactly 1 correct answer, MULTIPLE_CHOICE must have at least 1 correct answer, TEXT questions must have answer text ≤ 300 characters',
  }
);

export const questionIdSchema = z.object({
  questionId: z.string().uuid('Invalid question ID format'),
});

// Answer submission schemas
export const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid('Invalid question ID format'),
      selectedOptionIds: z.array(z.string().uuid('Invalid option ID format')).optional(),
      textAnswer: z.string().max(300, 'Text answer must be less than 300 characters').optional(),
    })
  ).min(1, 'At least one answer is required'),
}).refine(
  (data) => {
    // Each answer must have either selectedOptionIds or textAnswer, but not both
    return data.answers.every(answer => 
      (answer.selectedOptionIds && answer.selectedOptionIds.length > 0 && !answer.textAnswer) ||
      (answer.textAnswer && answer.textAnswer.trim().length > 0 && (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0))
    );
  },
  {
    message: 'Each answer must have either selectedOptionIds or textAnswer, but not both',
  }
);

// Type exports
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizIdInput = z.infer<typeof quizIdSchema>;
export type QuizIdParamInput = z.infer<typeof quizIdParamSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type QuestionIdInput = z.infer<typeof questionIdSchema>;
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;

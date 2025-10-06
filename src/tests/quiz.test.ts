import request from 'supertest';
import app from '../app';
import { prisma } from '../db/prisma';

// Test data
const testQuiz = {
  title: 'Test Quiz',
};

const testQuestion = {
  text: 'What is 2 + 2?',
  type: 'SINGLE_CHOICE' as const,
  options: [
    { text: '3', isCorrect: false },
    { text: '4', isCorrect: true },
    { text: '5', isCorrect: false },
  ],
};

const testMultipleChoiceQuestion = {
  text: 'Which are programming languages?',
  type: 'MULTIPLE_CHOICE' as const,
  options: [
    { text: 'JavaScript', isCorrect: true },
    { text: 'Python', isCorrect: true },
    { text: 'HTML', isCorrect: false },
    { text: 'TypeScript', isCorrect: true },
  ],
};

const testTextQuestion = {
  text: 'What is the capital of France?',
  type: 'TEXT' as const,
  options: [
    { text: 'Paris', isCorrect: true },
  ],
};

describe('Quiz API', () => {
  let quizId: string;
  let questionId: string;
  let multipleChoiceQuestionId: string;
  let textQuestionId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.$disconnect();
  });

  describe('Quiz Management', () => {
    describe('POST /api/quizzes', () => {
      it('should create a new quiz', async () => {
        const response = await request(app)
          .post('/api/quizzes')
          .send(testQuiz)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.title).toBe(testQuiz.title);
        expect(response.body.data.id).toBeDefined();
        
        quizId = response.body.data.id;
      });

      it('should fail to create quiz without title', async () => {
        const response = await request(app)
          .post('/api/quizzes')
          .send({})
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });

      it('should fail to create quiz with empty title', async () => {
        const response = await request(app)
          .post('/api/quizzes')
          .send({ title: '' })
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Validation failed');
      });
    });

    describe('GET /api/quizzes', () => {
      it('should get all quizzes', async () => {
        const response = await request(app)
          .get('/api/quizzes')
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('title');
        expect(response.body.data[0]).toHaveProperty('_count');
      });
    });

    describe('GET /api/quizzes/:id', () => {
      it('should get a quiz by ID', async () => {
        const response = await request(app)
          .get(`/api/quizzes/${quizId}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(quizId);
        expect(response.body.data.title).toBe(testQuiz.title);
      });

      it('should return 404 for non-existent quiz', async () => {
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        const response = await request(app)
          .get(`/api/quizzes/${fakeId}`)
          .expect(404);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Quiz not found');
      });
    });

    describe('PUT /api/quizzes/:id', () => {
      it('should update a quiz', async () => {
        const updatedTitle = 'Updated Test Quiz';
        const response = await request(app)
          .put(`/api/quizzes/${quizId}`)
          .send({ title: updatedTitle })
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.title).toBe(updatedTitle);
      });
    });
  });

  describe('Question Management', () => {
    describe('POST /api/quizzes/:quizId/questions', () => {
      it('should create a single choice question', async () => {
        const response = await request(app)
          .post(`/api/quizzes/${quizId}/questions`)
          .send(testQuestion)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.text).toBe(testQuestion.text);
        expect(response.body.data.type).toBe(testQuestion.type);
        expect(response.body.data.options).toHaveLength(3);
        
        questionId = response.body.data.id;
      });

      it('should create a multiple choice question', async () => {
        const response = await request(app)
          .post(`/api/quizzes/${quizId}/questions`)
          .send(testMultipleChoiceQuestion)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.type).toBe('MULTIPLE_CHOICE');
        
        multipleChoiceQuestionId = response.body.data.id;
      });

      it('should create a text question', async () => {
        const response = await request(app)
          .post(`/api/quizzes/${quizId}/questions`)
          .send(testTextQuestion)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.type).toBe('TEXT');
        
        textQuestionId = response.body.data.id;
      });

      it('should fail to create question with invalid data', async () => {
        const invalidQuestion = {
          text: '',
          type: 'SINGLE_CHOICE',
          options: [],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/questions`)
          .send(invalidQuestion)
          .expect(400);

        expect(response.body.status).toBe('error');
      });

      it('should fail to create single choice question with multiple correct answers', async () => {
        const invalidQuestion = {
          text: 'Invalid question',
          type: 'SINGLE_CHOICE',
          options: [
            { text: 'Option 1', isCorrect: true },
            { text: 'Option 2', isCorrect: true },
          ],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/questions`)
          .send(invalidQuestion)
          .expect(400);

        expect(response.body.status).toBe('error');
      });
    });

    describe('GET /api/quizzes/:quizId/questions', () => {
      it('should get questions for quiz (without correct answers)', async () => {
        const response = await request(app)
          .get(`/api/quizzes/${quizId}/questions`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(3);
        
        // Check that correct answers are not included
        response.body.data.forEach((question: any) => {
          question.options.forEach((option: any) => {
            expect(option.isCorrect).toBeUndefined();
          });
        });
      });
    });

    describe('GET /api/quizzes/:quizId/questions/admin', () => {
      it('should get questions with answers for admin', async () => {
        const response = await request(app)
          .get(`/api/quizzes/${quizId}/questions/admin`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // Check that correct answers are included
        const singleChoiceQuestion = response.body.data.find((q: any) => q.id === questionId);
        expect(singleChoiceQuestion.options.some((opt: any) => opt.isCorrect === true)).toBe(true);
      });
    });
  });

  describe('Quiz Taking and Scoring', () => {
    let correctOptionId: string;
    let multipleChoiceCorrectIds: string[];
    
    beforeAll(async () => {
      // Get the correct option IDs for testing
      const questionsResponse = await request(app)
        .get(`/api/quizzes/${quizId}/questions/admin`);
      
      const singleChoiceQuestion = questionsResponse.body.data.find((q: any) => q.id === questionId);
      correctOptionId = singleChoiceQuestion.options.find((opt: any) => opt.isCorrect).id;
      
      const multipleChoiceQuestion = questionsResponse.body.data.find((q: any) => q.id === multipleChoiceQuestionId);
      multipleChoiceCorrectIds = multipleChoiceQuestion.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);
    });

    describe('POST /api/quizzes/:quizId/submit', () => {
      it('should submit answers and get correct score', async () => {
        const answers = {
          answers: [
            {
              questionId: questionId,
              selectedOptionIds: [correctOptionId],
            },
            {
              questionId: multipleChoiceQuestionId,
              selectedOptionIds: multipleChoiceCorrectIds,
            },
            {
              questionId: textQuestionId,
              textAnswer: 'Paris',
            },
          ],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/submit`)
          .send(answers)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.score).toBe(3);
        expect(response.body.data.total).toBe(3);
        expect(response.body.data.percentage).toBe(100);
        expect(response.body.data.results).toHaveLength(3);
        
        // Check that all answers are marked as correct
        response.body.data.results.forEach((result: any) => {
          expect(result.isCorrect).toBe(true);
        });
      });

      it('should handle incorrect answers', async () => {
        const wrongOptionId = await request(app)
          .get(`/api/quizzes/${quizId}/questions/admin`)
          .then(res => {
            const singleChoiceQuestion = res.body.data.find((q: any) => q.id === questionId);
            return singleChoiceQuestion.options.find((opt: any) => !opt.isCorrect).id;
          });

        const answers = {
          answers: [
            {
              questionId: questionId,
              selectedOptionIds: [wrongOptionId],
            },
            {
              questionId: textQuestionId,
              textAnswer: 'London', // Wrong answer
            },
          ],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/submit`)
          .send(answers)
          .expect(200);

        expect(response.body.data.score).toBe(0);
        expect(response.body.data.total).toBe(3); // Total questions in quiz
        expect(response.body.data.percentage).toBe(0);
      });

      it('should handle case-insensitive text answers', async () => {
        const answers = {
          answers: [
            {
              questionId: textQuestionId,
              textAnswer: 'PARIS', // Different case
            },
          ],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/submit`)
          .send(answers)
          .expect(200);

        const textResult = response.body.data.results.find((r: any) => r.questionId === textQuestionId);
        expect(textResult.isCorrect).toBe(true);
      });

      it('should fail with invalid answer format', async () => {
        const invalidAnswers = {
          answers: [
            {
              questionId: questionId,
              // Missing both selectedOptionIds and textAnswer
            },
          ],
        };

        const response = await request(app)
          .post(`/api/quizzes/${quizId}/submit`)
          .send(invalidAnswers)
          .expect(400);

        expect(response.body.status).toBe('error');
      });
    });
  });

  describe('Individual Question Management', () => {
    describe('GET /api/questions/:questionId', () => {
      it('should get a question by ID', async () => {
        const response = await request(app)
          .get(`/api/questions/${questionId}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(questionId);
        expect(response.body.data.quiz).toBeDefined();
      });
    });

    describe('PUT /api/questions/:questionId', () => {
      it('should update a question', async () => {
        const updatedQuestion = {
          text: 'What is 3 + 3?',
          type: 'SINGLE_CHOICE' as const,
          options: [
            { text: '5', isCorrect: false },
            { text: '6', isCorrect: true },
            { text: '7', isCorrect: false },
          ],
        };

        const response = await request(app)
          .put(`/api/questions/${questionId}`)
          .send(updatedQuestion)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.text).toBe(updatedQuestion.text);
      });
    });

    describe('DELETE /api/questions/:questionId', () => {
      it('should delete a question', async () => {
        const response = await request(app)
          .delete(`/api/questions/${questionId}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.message).toBe('Question deleted successfully');
      });

      it('should return 404 when trying to get deleted question', async () => {
        const response = await request(app)
          .get(`/api/questions/${questionId}`)
          .expect(404);

        expect(response.body.status).toBe('error');
      });
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('should delete a quiz and all its questions', async () => {
      const response = await request(app)
        .delete(`/api/quizzes/${quizId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('Quiz deleted successfully');
    });

    it('should return 404 when trying to get deleted quiz', async () => {
      const response = await request(app)
        .get(`/api/quizzes/${quizId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});

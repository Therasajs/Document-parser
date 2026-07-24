import express, { Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { QuestionService } from '../services/questionService';

const router = express.Router();

// Admin auth middleware
const adminAuth = basicAuth({
  users: {
    [process.env.ADMIN_USERNAME || 'admin']: process.env.ADMIN_PASSWORD || 'SecurePass123!'
  },
  challenge: true,
  realm: 'Document Import Engine'
});

/**
 * GET /api/questions
 * Get all questions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const questions = await QuestionService.getAllQuestions(limit, offset);

    res.json({
      success: true,
      total: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/questions/:id
 * Get single question
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const question = await QuestionService.getQuestionById(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/questions/domain/:domain
 * Get questions by domain
 */
router.get('/domain/:domain', async (req: Request, res: Response) => {
  try {
    const domain = req.params.domain;
    const questions = await QuestionService.getQuestionsByDomain(domain);

    res.json({
      success: true,
      domain,
      total: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Get questions by domain error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/questions/difficulty/:difficulty
 * Get questions by difficulty
 */
router.get('/difficulty/:difficulty', async (req: Request, res: Response) => {
  try {
    const difficulty = req.params.difficulty;
    const questions = await QuestionService.getQuestionsByDifficulty(difficulty);

    res.json({
      success: true,
      difficulty,
      total: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Get questions by difficulty error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/questions/stats
 * Get statistics
 */
router.get('/stats/all', async (req: Request, res: Response) => {
  try {
    const stats = await QuestionService.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/questions/:id
 * Delete question (admin only)
 */
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await QuestionService.deleteQuestion(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/questions
 * Delete all questions (admin only)
 */
router.delete('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await QuestionService.deleteAllQuestions();

    res.json({
      success: true,
      message: `${deleted} questions deleted`
    });
  } catch (error) {
    console.error('Delete all questions error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

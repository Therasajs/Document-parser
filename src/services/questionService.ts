import { query } from '../database/connection';

export interface Question {
  id: number;
  question: string;
  question_normalized: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  difficulty?: string;
  domain?: string;
  created_at: Date;
  updated_at: Date;
}

export class QuestionService {
  /**
   * Get all questions
   */
  static async getAllQuestions(
    limit: number = 100,
    offset: number = 0
  ): Promise<Question[]> {
    try {
      const result = await query(
        `SELECT * FROM question_bank
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Get all questions error:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  static async getQuestionById(id: number): Promise<Question | null> {
    try {
      const result = await query(
        `SELECT * FROM question_bank WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Get question by ID error:', error);
      throw error;
    }
  }

  /**
   * Get questions by domain
   */
  static async getQuestionsByDomain(domain: string): Promise<Question[]> {
    try {
      const result = await query(
        `SELECT * FROM question_bank
         WHERE LOWER(domain) = LOWER($1)
         ORDER BY created_at DESC`,
        [domain]
      );

      return result.rows;
    } catch (error) {
      console.error('Get questions by domain error:', error);
      throw error;
    }
  }

  /**
   * Get questions by difficulty
   */
  static async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    try {
      const result = await query(
        `SELECT * FROM question_bank
         WHERE LOWER(difficulty) = LOWER($1)
         ORDER BY created_at DESC`,
        [difficulty]
      );

      return result.rows;
    } catch (error) {
      console.error('Get questions by difficulty error:', error);
      throw error;
    }
  }

  /**
   * Create question
   */
  static async createQuestion(
    question: string,
    questionNormalized: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctAnswer: string,
    domain?: string,
    difficulty?: string,
    explanation?: string
  ): Promise<Question> {
    try {
      const result = await query(
        `INSERT INTO question_bank (
          question, question_normalized, option_a, option_b,
          option_c, option_d, correct_answer, domain, difficulty, explanation
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          question,
          questionNormalized,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          domain,
          difficulty,
          explanation
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create question error:', error);
      throw error;
    }
  }

  /**
   * Delete question
   */
  static async deleteQuestion(id: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM question_bank WHERE id = $1`,
        [id]
      );

      return result.rowCount > 0;
    } catch (error) {
      console.error('Delete question error:', error);
      throw error;
    }
  }

  /**
   * Delete all questions
   */
  static async deleteAllQuestions(): Promise<number> {
    try {
      const result = await query(`DELETE FROM question_bank`);

      return result.rowCount || 0;
    } catch (error) {
      console.error('Delete all questions error:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  static async getStatistics(): Promise<any> {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_questions,
          COUNT(DISTINCT domain) as total_domains,
          COUNT(DISTINCT difficulty) as total_difficulties,
          MAX(created_at) as last_import
        FROM question_bank
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Batch insert questions
   */
  static async batchInsert(questions: any[]): Promise<number> {
    try {
      const placeholders = questions
        .map(
          (_, i) =>
            `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`
        )
        .join(',');

      const values = questions.flatMap((q) => [
        q.question,
        q.question_normalized,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.domain,
        q.difficulty,
        q.explanation
      ]);

      const result = await query(
        `INSERT INTO question_bank (
          question, question_normalized, option_a, option_b,
          option_c, option_d, correct_answer, domain, difficulty, explanation
        ) VALUES ${placeholders}`,
        values
      );

      return result.rowCount || 0;
    } catch (error) {
      console.error('Batch insert error:', error);
      throw error;
    }
  }
}

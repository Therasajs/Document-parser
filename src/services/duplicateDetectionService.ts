import { query } from '../database/connection';
import { NormalizationService } from './normalizationService';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedQuestionId?: number;
  similarity: number;
}

export class DuplicateDetectionService {
  private static readonly EXACT_MATCH_THRESHOLD = 100;
  private static readonly FUZZY_MATCH_THRESHOLD = 90;

  /**
   * Check if question is a duplicate
   */
  static async isDuplicate(
    question: string,
    fuzzyMatch: boolean = false
  ): Promise<DuplicateCheckResult> {
    const normalized = NormalizationService.normalize(question);

    if (!normalized || normalized.length === 0) {
      return {
        isDuplicate: false,
        similarity: 0
      };
    }

    try {
      // Check for exact match
      const exactMatch = await query(
        `SELECT id, similarity FROM (
          SELECT id,
                 100 as similarity
          FROM question_bank
          WHERE question_normalized = $1
        ) AS matches
        ORDER BY similarity DESC
        LIMIT 1`,
        [normalized]
      );

      if (exactMatch.rows.length > 0) {
        return {
          isDuplicate: true,
          matchedQuestionId: exactMatch.rows[0].id,
          similarity: 100
        };
      }

      // Check for fuzzy match if enabled
      if (fuzzyMatch) {
        const allQuestions = await query(
          `SELECT id, question_normalized
           FROM question_bank
           LIMIT 100`
        );

        let bestMatch = {
          id: 0,
          similarity: 0
        };

        for (const row of allQuestions.rows) {
          const similarity = NormalizationService.calculateSimilarity(
            question,
            row.question_normalized
          );

          if (similarity > bestMatch.similarity) {
            bestMatch = {
              id: row.id,
              similarity
            };
          }
        }

        if (bestMatch.similarity >= this.FUZZY_MATCH_THRESHOLD) {
          return {
            isDuplicate: true,
            matchedQuestionId: bestMatch.id,
            similarity: bestMatch.similarity
          };
        }
      }

      return {
        isDuplicate: false,
        similarity: 0
      };
    } catch (error) {
      console.error('Duplicate detection error:', error);
      throw error;
    }
  }

  /**
   * Find similar questions
   */
  static async findSimilarQuestions(
    question: string,
    threshold: number = 85
  ): Promise<Array<{ id: number; question: string; similarity: number }>> {
    try {
      const allQuestions = await query(`SELECT id, question FROM question_bank`);

      const similar = allQuestions.rows
        .map((row: any) => ({
          id: row.id,
          question: row.question,
          similarity: NormalizationService.calculateSimilarity(
            question,
            row.question
          )
        }))
        .filter((item: any) => item.similarity >= threshold)
        .sort((a: any, b: any) => b.similarity - a.similarity);

      return similar;
    } catch (error) {
      console.error('Find similar questions error:', error);
      throw error;
    }
  }

  /**
   * Count duplicates by normalized text
   */
  static async countDuplicates(normalizedText: string): Promise<number> {
    try {
      const result = await query(
        `SELECT COUNT(*) as count FROM question_bank WHERE question_normalized = $1`,
        [normalizedText]
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Count duplicates error:', error);
      throw error;
    }
  }
}

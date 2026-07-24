import { query } from '../database/connection';
import { ParsingService, ParsedRow } from '../parsers/parsingService';
import { ValidationService } from './validationService';
import { NormalizationService } from './normalizationService';
import { DuplicateDetectionService } from './duplicateDetectionService';
import { QuestionService } from './questionService';

export interface ImportSummary {
  totalRecords: number;
  savedRecords: number;
  duplicateRecords: number;
  failedRecords: number;
  processingTimeMs: number;
  processedAt: Date;
  errors: string[];
  duplicateReasons: string[];
}

export class ImportService {
  private static readonly BATCH_SIZE = 50;

  /**
   * Complete import workflow
   * 1. Parse file
   * 2. Validate each row
   * 3. Check for duplicates
   * 4. Normalize text
   * 5. Batch insert to database
   * 6. Generate report
   */
  static async importFile(
    filename: string,
    buffer: Buffer
  ): Promise<ImportSummary> {
    const startTime = Date.now();
    const errors: string[] = [];
    const duplicateReasons: string[] = [];

    let totalRecords = 0;
    let savedRecords = 0;
    let duplicateRecords = 0;
    let failedRecords = 0;

    try {
      // Step 1: Parse file
      console.log(`📥 Starting import: ${filename}`);
      const parsedRows = await ParsingService.parseFile(filename, buffer);
      totalRecords = parsedRows.length;

      // Step 2-5: Process each row
      const batch: any[] = [];

      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];

        try {
          // Extract fields with flexible matching
          const question = ParsingService.findValue(
            row,
            'question',
            'q',
            'text',
            'que'
          );
          const optionA = ParsingService.findValue(
            row,
            'option_a',
            'optiona',
            'a',
            'option1'
          );
          const optionB = ParsingService.findValue(
            row,
            'option_b',
            'optionb',
            'b',
            'option2'
          );
          const optionC = ParsingService.findValue(
            row,
            'option_c',
            'optionc',
            'c',
            'option3'
          );
          const optionD = ParsingService.findValue(
            row,
            'option_d',
            'optiond',
            'd',
            'option4'
          );
          const correctAnswer = ParsingService.findValue(
            row,
            'answer',
            'ans',
            'correct_answer',
            'ca'
          );
          const difficulty = ParsingService.findValue(
            row,
            'difficulty',
            'level',
            'standard'
          );
          const domain = ParsingService.findValue(
            row,
            'domain',
            'subject',
            'category'
          );
          const explanation = ParsingService.findValue(row, 'explanation', 'exp');

          // Validate
          const validation = ValidationService.validateQuestion(
            question || '',
            optionA || '',
            optionB || '',
            optionC || '',
            optionD || '',
            correctAnswer || ''
          );

          if (!validation.isValid) {
            failedRecords++;
            errors.push(
              `Row ${i + 1}: ${validation.errors.map((e) => e.message).join(', ')}`
            );
            continue;
          }

          // Normalize and check duplicates (identify but don't skip)
          const normalized = NormalizationService.normalize(question || '');
          const duplicate = await DuplicateDetectionService.isDuplicate(
            question || ''
          );

          if (duplicate.isDuplicate) {
            duplicateRecords++;
            duplicateReasons.push(
              `Row ${i + 1}: "${question}" (matched ID: ${duplicate.matchedQuestionId})`
            );
            // Continue to store anyway - don't skip
          }

          // Add to batch
          batch.push({
            question,
            question_normalized: normalized,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer?.toUpperCase(),
            domain,
            difficulty,
            explanation
          });

          // Flush batch when full
          if (batch.length >= this.BATCH_SIZE) {
            const inserted = await QuestionService.batchInsert(batch);
            savedRecords += inserted;
            batch.length = 0;
          }
        } catch (error) {
          failedRecords++;
          errors.push(
            `Row ${i + 1}: ${(error as Error).message}`
          );
        }
      }

      // Flush remaining batch
      if (batch.length > 0) {
        const inserted = await QuestionService.batchInsert(batch);
        savedRecords += inserted;
      }

      const processingTimeMs = Date.now() - startTime;

      // Log import
      await this.logImport(
        0,
        totalRecords,
        savedRecords,
        duplicateRecords,
        failedRecords,
        processingTimeMs,
        errors,
        'SUCCESS'
      );

      console.log(`✅ Import complete: ${savedRecords} saved, ${duplicateRecords} duplicates, ${failedRecords} failed`);

      return {
        totalRecords,
        savedRecords,
        duplicateRecords,
        failedRecords,
        processingTimeMs,
        processedAt: new Date(),
        errors,
        duplicateReasons
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      console.error('❌ Import failed:', error);

      await this.logImport(
        0,
        totalRecords,
        savedRecords,
        duplicateRecords,
        failedRecords,
        processingTimeMs,
        [(error as Error).message],
        'FAILED'
      );

      throw error;
    }
  }

  /**
   * Log import to database
   */
  private static async logImport(
    documentId: number,
    totalRecords: number,
    savedRecords: number,
    duplicateRecords: number,
    failedRecords: number,
    processingTimeMs: number,
    errors: string[],
    status: string
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO import_logs (
          document_id, total_records, saved_records,
          duplicate_records, failed_records, processing_time_ms, errors, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          documentId || null,
          totalRecords,
          savedRecords,
          duplicateRecords,
          failedRecords,
          processingTimeMs,
          errors.join('\n'),
          status
        ]
      );
    } catch (error) {
      console.error('Error logging import:', error);
    }
  }
}

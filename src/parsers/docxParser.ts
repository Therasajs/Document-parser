import * as mammoth from 'mammoth';
import { TxtParser } from './txtParser';
import { ParsedRow } from './parsingService';

/**
 * DOCX Parser - Uses only mammoth library
 * Extracts text and delegates to TXT parser for structure
 */
export class DocxParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('No text found in DOCX file');
      }

      // Convert extracted text to buffer and parse as TXT
      const textBuffer = Buffer.from(text, 'utf-8');
      const rows = await TxtParser.parse(textBuffer);

      console.log(`✅ DOCX parsed: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX file: ${(error as Error).message}`);
    }
  }
}

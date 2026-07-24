import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { TxtParser } from './txtParser';
import { ParsedRow } from './parsingService';

/**
 * PDF Parser - Uses only pdfjs-dist library
 * Extracts text and delegates to TXT parser
 */
export class PdfParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text found in PDF file');
      }

      // Convert extracted text to buffer and parse as TXT
      const textBuffer = Buffer.from(fullText, 'utf-8');
      const rows = await TxtParser.parse(textBuffer);

      console.log(`✅ PDF parsed: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF file: ${(error as Error).message}`);
    }
  }
}

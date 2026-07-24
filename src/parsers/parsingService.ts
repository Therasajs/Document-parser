import { Request } from 'express';
import { TxtParser } from './txtParser';
import { JsonParser } from './jsonParser';
import { CsvParser } from './csvParser';
import { XlsxParser } from './xlsxParser';
import { DocxParser } from './docxParser';
import { PdfParser } from './pdfParser';
import { XmlParser } from './xmlParser';
import { TsvParser } from './tsvParser';

export interface ParsedRow {
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  difficulty?: string;
  domain?: string;
  explanation?: string;
  [key: string]: any;
}

export class ParsingService {
  /**
   * Parse file based on extension
   * Uses ONLY libraries: xlsx, csv-parser, xml2js, pdfjs-dist, mammoth, etc.
   */
  static async parseFile(
    filename: string,
    buffer: Buffer
  ): Promise<ParsedRow[]> {
    const extension = this.getFileExtension(filename);

    console.log(`📄 Parsing ${filename} (${extension})`);

    switch (extension.toLowerCase()) {
      case 'txt':
        return await TxtParser.parse(buffer);

      case 'json':
        return await JsonParser.parse(buffer);

      case 'csv':
        return await CsvParser.parse(buffer);

      case 'tsv':
        return await TsvParser.parse(buffer);

      case 'xlsx':
      case 'xls':
        return await XlsxParser.parse(buffer);

      case 'docx':
        return await DocxParser.parse(buffer);

      case 'pdf':
        return await PdfParser.parse(buffer);

      case 'xml':
        return await XmlParser.parse(buffer);

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  /**
   * Get file extension
   */
  private static getFileExtension(filename: string): string {
    if (!filename.includes('.')) {
      throw new Error('File must have an extension');
    }
    return filename.substring(filename.lastIndexOf('.') + 1);
  }

  /**
   * Find value in parsed row by multiple candidate keys
   * Flexible matching for different column names
   */
  static findValue(row: ParsedRow, ...candidates: string[]): string | undefined {
    for (const candidate of candidates) {
      const normalized = candidate.toLowerCase().replace(/[_\s-]/g, '');

      for (const [key, value] of Object.entries(row)) {
        const keyNormalized = key.toLowerCase().replace(/[_\s-]/g, '');

        if (keyNormalized === normalized && value) {
          return String(value).trim();
        }
      }
    }

    return undefined;
  }
}

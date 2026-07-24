import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { ParsedRow } from './parsingService';

/**
 * CSV Parser - Uses only csv-parser library
 */
export class CsvParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
      const rows: ParsedRow[] = [];

      try {
        const readable = Readable.from([buffer]);

        readable
          .pipe(csvParser())
          .on('data', (row: any) => {
            // Normalize column names to lowercase
            const normalizedRow: ParsedRow = {};
            for (const [key, value] of Object.entries(row)) {
              normalizedRow[key.toLowerCase()] = value;
            }
            rows.push(normalizedRow);
          })
          .on('end', () => {
            console.log(`✅ CSV parsed: ${rows.length} rows`);
            resolve(rows);
          })
          .on('error', (error: Error) => {
            reject(new Error(`Failed to parse CSV file: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`CSV parsing error: ${(error as Error).message}`));
      }
    });
  }
}

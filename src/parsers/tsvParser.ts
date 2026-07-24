import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { ParsedRow } from './parsingService';

/**
 * TSV Parser - Uses csv-parser with tab delimiter
 */
export class TsvParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
      const rows: ParsedRow[] = [];

      try {
        const readable = Readable.from([buffer]);

        readable
          .pipe(csvParser({ separator: '\t' }))
          .on('data', (row: any) => {
            const normalizedRow: ParsedRow = {};
            for (const [key, value] of Object.entries(row)) {
              normalizedRow[key.toLowerCase()] = value;
            }
            rows.push(normalizedRow);
          })
          .on('end', () => {
            console.log(`✅ TSV parsed: ${rows.length} rows`);
            resolve(rows);
          })
          .on('error', (error: Error) => {
            reject(new Error(`Failed to parse TSV file: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`TSV parsing error: ${(error as Error).message}`));
      }
    });
  }
}

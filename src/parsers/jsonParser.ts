import { ParsedRow } from './parsingService';

/**
 * JSON Parser - Uses only native JavaScript JSON parsing
 * No custom logic, just library (JSON.parse)
 */
export class JsonParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const jsonText = buffer.toString('utf-8');
      const data = JSON.parse(jsonText);

      const rows: ParsedRow[] = [];

      // Handle both array of objects and single object
      if (Array.isArray(data)) {
        rows.push(...data);
      } else if (typeof data === 'object' && data !== null) {
        rows.push(data);
      } else {
        throw new Error('JSON must be an object or array of objects');
      }

      console.log(`✅ JSON parsed: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse JSON file: ${(error as Error).message}`);
    }
  }
}

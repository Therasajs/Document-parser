import * as XLSX from 'xlsx';
import { ParsedRow } from './parsingService';

/**
 * XLSX Parser - Uses only xlsx library
 */
export class XlsxParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      // Convert to JSON
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Normalize column names
      const normalizedRows: ParsedRow[] = rows.map((row) => {
        const normalizedRow: ParsedRow = {};
        for (const [key, value] of Object.entries(row)) {
          normalizedRow[key.toLowerCase()] = value;
        }
        return normalizedRow;
      });

      console.log(`✅ XLSX parsed: ${normalizedRows.length} rows`);
      return normalizedRows;
    } catch (error) {
      console.error('XLSX parsing error:', error);
      throw new Error(`Failed to parse XLSX file: ${(error as Error).message}`);
    }
  }
}

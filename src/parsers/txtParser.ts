import { ParsedRow } from './parsingService';

/**
 * TXT Parser - Uses only string operations
 * Pattern: Question\\nOption A\\nOption B\\nOption C\\nOption D\\nAnswer
 */
export class TxtParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const content = buffer.toString('utf-8');
      const lines = content.split(/\r?\n/).map((line) => line.trim());

      const rows: ParsedRow[] = [];
      let currentRow: ParsedRow = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!line) continue;

        // Detect question (starts with "Question" or "Q:")
        if (/^(question|q:|\d+\.)/i.test(line)) {
          if (Object.keys(currentRow).length > 0) {
            rows.push(currentRow);
          }
          currentRow = { question: line.replace(/^(question|q:|^\d+\.\s*)/i, '') };
        }
        // Detect option A
        else if (/^(a\.|option\s+a|a\))/i.test(line)) {
          currentRow.option_a = line.replace(/^(a\.|option\s+a|a\))\s*/i, '');
        }
        // Detect option B
        else if (/^(b\.|option\s+b|b\))/i.test(line)) {
          currentRow.option_b = line.replace(/^(b\.|option\s+b|b\))\s*/i, '');
        }
        // Detect option C
        else if (/^(c\.|option\s+c|c\))/i.test(line)) {
          currentRow.option_c = line.replace(/^(c\.|option\s+c|c\))\s*/i, '');
        }
        // Detect option D
        else if (/^(d\.|option\s+d|d\))/i.test(line)) {
          currentRow.option_d = line.replace(/^(d\.|option\s+d|d\))\s*/i, '');
        }
        // Detect correct answer
        else if (/^(answer|correct|ans)[\s:]/i.test(line)) {
          const answer = line.match(/[A-D]/i)?.[0]?.toUpperCase();
          if (answer) currentRow.correct_answer = answer;
        }
        // Detect domain/difficulty
        else if (/^(domain|subject)/i.test(line)) {
          currentRow.domain = line.replace(/^(domain|subject)[\s:]+/i, '');
        } else if (/^(difficulty|level)/i.test(line)) {
          currentRow.difficulty = line.replace(/^(difficulty|level)[\s:]+/i, '');
        }
      }

      if (Object.keys(currentRow).length > 0) {
        rows.push(currentRow);
      }

      console.log(`✅ TXT parsed: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('TXT parsing error:', error);
      throw new Error(`Failed to parse TXT file: ${(error as Error).message}`);
    }
  }
}

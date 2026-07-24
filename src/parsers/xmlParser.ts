import { parseStringPromise } from 'xml2js';
import { ParsedRow } from './parsingService';

/**
 * XML Parser - Uses only xml2js library
 */
export class XmlParser {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      const xmlText = buffer.toString('utf-8');
      const parsed = await parseStringPromise(xmlText);

      const rows: ParsedRow[] = [];

      // Handle different XML structures
      // Try common patterns: root.question[], root.item[], root.row[]
      let items: any[] = [];

      if (parsed.root?.question) {
        items = Array.isArray(parsed.root.question)
          ? parsed.root.question
          : [parsed.root.question];
      } else if (parsed.root?.item) {
        items = Array.isArray(parsed.root.item)
          ? parsed.root.item
          : [parsed.root.item];
      } else if (parsed.root?.row) {
        items = Array.isArray(parsed.root.row)
          ? parsed.root.row
          : [parsed.root.row];
      } else {
        // Try first child element
        const keys = Object.keys(parsed.root || {});
        if (keys.length > 0) {
          items = Array.isArray(parsed.root[keys[0]])
            ? parsed.root[keys[0]]
            : [parsed.root[keys[0]]];
        }
      }

      for (const item of items) {
        const row: ParsedRow = {};

        for (const [key, value] of Object.entries(item)) {
          if (Array.isArray(value) && value.length > 0) {
            row[key.toLowerCase()] = String(value[0]);
          } else {
            row[key.toLowerCase()] = value;
          }
        }

        if (Object.keys(row).length > 0) {
          rows.push(row);
        }
      }

      console.log(`✅ XML parsed: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('XML parsing error:', error);
      throw new Error(`Failed to parse XML file: ${(error as Error).message}`);
    }
  }
}

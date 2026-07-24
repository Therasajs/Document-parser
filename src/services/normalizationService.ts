import { deburr, trim } from 'lodash';

export class NormalizationService {
  /**
   * Normalize text for duplicate detection
   * Process:
   * 1. Trim whitespace
   * 2. Convert to lowercase
   * 3. Normalize line breaks
   * 4. Expand HTML entities
   * 5. Remove accents
   * 6. Remove punctuation
   * 7. Collapse multiple spaces
   */
  static normalize(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let normalized = text;

    // Step 1: Trim
    normalized = trim(normalized);

    // Step 2: Lowercase
    normalized = normalized.toLowerCase();

    // Step 3: Normalize line breaks
    normalized = normalized.replace(/\r\n|\r|\n/g, ' ');

    // Step 4: Expand HTML entities
    normalized = normalized.replace(/&nbsp;/g, ' ');
    normalized = normalized.replace(/&amp;/g, '&');
    normalized = normalized.replace(/&lt;/g, '<');
    normalized = normalized.replace(/&gt;/g, '>');
    normalized = normalized.replace(/&quot;/g, '"');
    normalized = normalized.replace(/&#39;/g, "'");

    // Step 5: Remove accents using lodash deburr
    normalized = deburr(normalized);

    // Step 6: Remove punctuation
    normalized = normalized.replace(/[.,;:!?"'()\-–—]/g, '');

    // Step 7: Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');

    // Final trim
    normalized = trim(normalized);

    return normalized;
  }

  /**
   * Calculate Levenshtein distance for similarity matching
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calculate similarity score (0-100) between two strings
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalize(str1);
    const normalized2 = this.normalize(str2);

    if (normalized1 === normalized2) {
      return 100;
    }

    const maxLen = Math.max(normalized1.length, normalized2.length);
    if (maxLen === 0) return 100;

    const distance = this.levenshteinDistance(normalized1, normalized2);
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return Math.round(similarity);
  }
}

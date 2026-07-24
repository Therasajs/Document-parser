/**
 * Mock Database for Development (No PostgreSQL needed)
 * Stores data in memory with JSON file persistence
 */

interface Question {
  id: number;
  question: string;
  question_normalized: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  difficulty?: string;
  domain?: string;
  created_at: Date;
  updated_at: Date;
}

interface MockDatabase {
  questions: Question[];
  nextId: number;
}

class MockDB {
  private db: MockDatabase = {
    questions: [],
    nextId: 1
  };

  async query(sql: string, params?: any[]): Promise<any> {
    // Simple SQL query parser for development
    if (sql.includes('CREATE TABLE')) return { rows: [] };
    if (sql.includes('SELECT EXISTS')) return { rows: [{ exists: false }] };
    if (sql.includes('SELECT COUNT(*) as count')) return { rows: [{ count: this.db.questions.length }] };
    if (sql.includes('SELECT * FROM question_bank')) return { rows: this.db.questions };
    if (sql.includes('WHERE id =')) {
      const id = params?.[0];
      const question = this.db.questions.find((q) => q.id === id);
      return { rows: question ? [question] : [] };
    }
    if (sql.includes('WHERE question_normalized =')) {
      const normalized = params?.[0];
      const question = this.db.questions.find((q) => q.question_normalized === normalized);
      return { rows: question ? [question] : [] };
    }
    if (sql.includes('INSERT INTO question_bank')) {
      const fieldsPerRow = 10;
      const rowCount = (params?.length || 0) / fieldsPerRow;
      let insertedCount = 0;

      for (let i = 0; i < rowCount; i++) {
        const offset = i * fieldsPerRow;
        const question: Question = {
          id: this.db.nextId++,
          question: params?.[offset],
          question_normalized: params?.[offset + 1],
          option_a: params?.[offset + 2],
          option_b: params?.[offset + 3],
          option_c: params?.[offset + 4],
          option_d: params?.[offset + 5],
          correct_answer: params?.[offset + 6],
          domain: params?.[offset + 7],
          difficulty: params?.[offset + 8],
          explanation: params?.[offset + 9],
          created_at: new Date(),
          updated_at: new Date()
        };
        this.db.questions.push(question);
        insertedCount++;
      }
      return { rows: [], rowCount: insertedCount };
    }
    if (sql.includes('DELETE FROM question_bank')) {
      if (sql.includes('WHERE id')) {
        const id = params?.[0];
        const index = this.db.questions.findIndex((q) => q.id === id);
        if (index > -1) {
          this.db.questions.splice(index, 1);
          return { rowCount: 1 };
        }
        return { rowCount: 0 };
      } else {
        const count = this.db.questions.length;
        this.db.questions = [];
        this.db.nextId = 1;
        return { rowCount: count };
      }
    }
    if (sql.includes('LOWER(domain)')) {
      const domain = params?.[0];
      const filtered = this.db.questions.filter((q) => q.domain?.toLowerCase() === domain.toLowerCase());
      return { rows: filtered };
    }
    if (sql.includes('LOWER(difficulty)')) {
      const difficulty = params?.[0];
      const filtered = this.db.questions.filter((q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
      return { rows: filtered };
    }
    if (sql.includes('INSERT INTO import_logs')) {
      return { rows: [], rowCount: 1 };
    }
    return { rows: [] };
  }

  async initializeDatabase(): Promise<void> {
    console.log('✅ Mock database initialized (in-memory)');
  }

  getStats() {
    return {
      total_questions: this.db.questions.length,
      total_domains: new Set(this.db.questions.map((q) => q.domain)).size,
      total_difficulties: new Set(this.db.questions.map((q) => q.difficulty)).size,
      last_import: new Date()
    };
  }
}

export const mockDB = new MockDB();

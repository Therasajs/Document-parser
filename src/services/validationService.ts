export interface ValidationError {
  code: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationService {
  /**
   * Validate a question against 15+ rules
   */
  static validateQuestion(
    question: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctAnswer: string
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Rule 1: Question required
    if (!question || question.trim().length === 0) {
      errors.push({
        code: 'MISSING_QUESTION',
        message: 'Question is required'
      });
    }

    // Rule 2: Question length min 5
    if (question && question.length < 5) {
      errors.push({
        code: 'QUESTION_TOO_SHORT',
        message: 'Question must be at least 5 characters'
      });
    }

    // Rule 3: Question length max 5000
    if (question && question.length > 5000) {
      errors.push({
        code: 'QUESTION_TOO_LONG',
        message: 'Question must not exceed 5000 characters'
      });
    }

    // Rule 4: Question not only numbers
    if (question && /^\d+$/.test(question.replace(/\s/g, ''))) {
      errors.push({
        code: 'QUESTION_INVALID',
        message: 'Question cannot contain only numbers'
      });
    }

    // Rule 5-6: Count non-empty options
    const nonEmptyOptions = [optionA, optionB, optionC, optionD].filter(
      (o) => o && o.trim().length > 0
    ).length;

    if (nonEmptyOptions < 2) {
      errors.push({
        code: 'INSUFFICIENT_OPTIONS',
        message: 'Minimum 2 options required'
      });
    }

    if (nonEmptyOptions > 4) {
      errors.push({
        code: 'TOO_MANY_OPTIONS',
        message: 'Maximum 4 options allowed'
      });
    }

    // Rule 7-10: Option length checks
    if (optionA && optionA.length > 2000) {
      errors.push({
        code: 'OPTION_A_TOO_LONG',
        message: 'Option A must not exceed 2000 characters'
      });
    }

    if (optionB && optionB.length > 2000) {
      errors.push({
        code: 'OPTION_B_TOO_LONG',
        message: 'Option B must not exceed 2000 characters'
      });
    }

    if (optionC && optionC.length > 2000) {
      errors.push({
        code: 'OPTION_C_TOO_LONG',
        message: 'Option C must not exceed 2000 characters'
      });
    }

    if (optionD && optionD.length > 2000) {
      errors.push({
        code: 'OPTION_D_TOO_LONG',
        message: 'Option D must not exceed 2000 characters'
      });
    }

    // Rule 11: Answer required
    if (!correctAnswer || correctAnswer.trim().length === 0) {
      errors.push({
        code: 'MISSING_ANSWER',
        message: 'Correct answer is required'
      });
    }

    // Rule 12: Answer format A/B/C/D
    if (
      correctAnswer &&
      !['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())
    ) {
      errors.push({
        code: 'INVALID_ANSWER_FORMAT',
        message: 'Correct answer must be A, B, C, or D'
      });
    }

    // Rule 13: Answer references valid option
    if (correctAnswer) {
      const answerIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      const options = [optionA, optionB, optionC, optionD];
      const selectedOption = options[answerIndex];

      if (!selectedOption || selectedOption.trim().length === 0) {
        errors.push({
          code: 'INVALID_ANSWER_REF',
          message: 'Correct answer must reference a non-empty option'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

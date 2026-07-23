# Question Validation Rules

## Overview

Every question imported through the Document Import Engine goes through comprehensive validation to ensure data quality. This document describes all validation rules applied.

## Validation Stages

```
Input Row
   ↓
Stage 1: Field Extraction
   ↓
Stage 2: Question Text Validation
   ├─ Non-empty check
   ├─ Length check (5-5000 chars)
   ├─ Content validation (not only numbers)
   └─ Trim whitespace
   ↓
Stage 3: Options Validation
   ├─ Count check (min 2 options)
   ├─ Length check per option (1-2000 chars)
   └─ Trim whitespace
   ↓
Stage 4: Answer Validation
   ├─ Non-empty check
   ├─ Format check (must be A/B/C/D)
   └─ Reference check (referenced option must exist)
   ↓
Stage 5: Optional Fields
   ├─ Explanation: trim, optional
   ├─ Difficulty: normalize, optional
   └─ Domain: normalize, optional
   ↓
Stage 6: Duplicate Detection
   ├─ Normalize question text
   ├─ Query database
   └─ Skip if duplicate
   ↓
Success: Store in Database
```

## Validation Rules by Field

### Question Text

| Rule | Requirement | Error Code | Message |
|------|-------------|-----------|---------|
| Required | Must not be null or empty | `MISSING_QUESTION` | Question text is required |
| Min Length | Minimum 5 characters | `QUESTION_TOO_SHORT` | Question must be at least 5 characters |
| Max Length | Maximum 5000 characters | `QUESTION_TOO_LONG` | Question cannot exceed 5000 characters |
| Content | Cannot be only numbers | `QUESTION_INVALID` | Question cannot contain only numbers |
| Whitespace | Automatically trimmed | — | Removed before validation |

**Examples:**

| Input | Valid? | Reason |
|-------|--------|--------|
| `"What is 2+2?"` | ✅ Yes | Valid text, 11 chars |
| `""` (empty) | ❌ No | Empty string |
| `"abc"` | ❌ No | Only 3 chars (< 5) |
| `"12345"` | ❌ No | Only numbers |
| `"  What is 2+2?  "` | ✅ Yes | Trimmed to "What is 2+2?" (11 chars) |
| Text with 5001 chars | ❌ No | Exceeds 5000 char limit |

### Options (A, B, C, D)

| Rule | Requirement | Error Code | Message |
|------|-------------|-----------|---------|
| Minimum Count | At least 2 non-empty options | `INSUFFICIENT_OPTIONS` | At least 2 options are required |
| Max Count | Maximum 4 options | — | Only A, B, C, D available |
| Min Length | Minimum 1 character | `OPTION_EMPTY` | Option cannot be empty |
| Max Length | Maximum 2000 characters | `OPTION_TOO_LONG` | Option exceeds 2000 characters |
| Whitespace | Automatically trimmed | — | Removed before storage |
| Null Handling | Null treated as empty | — | Same as empty string |

**Examples:**

| Options | Valid? | Reason |
|---------|--------|--------|
| A="Yes", B="No", C=empty, D=empty | ✅ Yes | 2 options (minimum) |
| A="Yes", B="No", C="Maybe", D=empty | ✅ Yes | 3 options |
| A="Yes", B="No", C="Maybe", D="N/A" | ✅ Yes | 4 options (full) |
| A="Yes", B=empty, C=empty, D=empty | ❌ No | Only 1 option (< 2) |
| A=empty, B=empty, C=empty, D=empty | ❌ No | No options |
| A="x" (1 char), B="y" | ✅ Yes | Minimum length acceptable |

### Correct Answer

| Rule | Requirement | Error Code | Message |
|------|-------------|-----------|---------|
| Required | Must not be null or empty | `MISSING_ANSWER` | Correct answer is required |
| Format | Must be A, B, C, or D | `INVALID_ANSWER_FORMAT` | Must be A, B, C, or D |
| Case | Case-insensitive | — | Both 'a' and 'A' accepted |
| Reference | Must reference non-empty option | `INVALID_ANSWER_REFERENCE` | Answer references empty option |
| Whitespace | Automatically trimmed | — | Removed before validation |

**Examples:**

| Answer | Options | Valid? | Reason |
|--------|---------|--------|--------|
| `"B"` | A, B, C, D | ✅ Yes | Valid format, references non-empty B |
| `"b"` | A, B, C, D | ✅ Yes | Lowercase accepted |
| `" B "` | A, B, C, D | ✅ Yes | Trimmed to "B" |
| `"E"` | A, B, C, D | ❌ No | E not valid (only A-D) |
| `"1"` | A, B, C, D | ❌ No | Must use letter (A-D) |
| `""` | A, B, C, D | ❌ No | Empty |
| `"B"` | A="Yes", B=empty, C=No, D=No | ❌ No | References empty option B |

### Optional Fields

#### Explanation
- **Type**: Text (optional)
- **Constraints**: None
- **Processing**: Trimmed before storage
- **Max Length**: Unlimited (stored as TEXT)

#### Difficulty
- **Type**: String (optional)
- **Recommended Values**: Easy, Medium, Hard
- **Processing**: Trimmed before storage
- **Max Length**: 50 characters
- **Examples**: "Easy", "Medium", "Hard", "Intermediate", "Advanced"

#### Domain
- **Type**: String (optional)
- **Recommended Values**: Subject or category name
- **Processing**: Trimmed before storage
- **Max Length**: 100 characters
- **Examples**: "Mathematics", "Science", "History", "Geography"

## Duplicate Detection

### Normalization Process

```
Step 1: Lowercase conversion
   "What IS the capital?" → "what is the capital?"

Step 2: Normalize line breaks
   "What is\nthe capital?" → "what is the capital?"

Step 3: Remove HTML entities
   "What&nbsp;is?" → "what is?"

Step 4: Remove accents
   "Café" → "cafe"

Step 5: Remove punctuation
   "What is the capital?" → "What is the capital"

Step 6: Normalize whitespace
   "What  is   the capital" → "what is the capital"

Step 7: Trim edges
   " what is the capital " → "what is the capital"

Output (Normalized): "what is the capital"
```

### Duplicate Detection Rules

| Rule | Comparison | Detection |
|------|-----------|-----------|
| Exact Match | Normalized text equality | Immediate (hash index) |
| Fuzzy Match | Levenshtein distance > threshold | Optional (not default) |
| Cross-Table | Query database by normalized text | Per insert |
| Within Batch | Check batch for duplicates before DB | No (relies on batch commit) |

### Duplicate Handling

**When Duplicate Found:**
- ✅ Skip insertion
- ✅ Increment duplicate counter
- ✅ Log duplicate with original ID
- ✅ Include in error summary
- ✅ Continue processing remaining records

**Example:**
```
Row 5: Question: "What is the capital of France?"
  → Normalized: "what is the capital of france"
  → Query result: Found ID 42 with same normalized text
  → Action: Skip, log "Row 5: duplicate question - Exact match (ID: 42)"
  → Continue to Row 6
```

## Validation Error Format

### Error Structure
```java
class ValidationError {
    String code;        // Error type (e.g., MISSING_QUESTION)
    String message;     // Human-readable description
}
```

### Error Messages in Import Summary

```json
{
  "totalRecords": 10,
  "savedRecords": 8,
  "duplicateRecords": 1,
  "failedRecords": 1,
  "errors": [
    "Row 3 [INSUFFICIENT_OPTIONS]: At least 2 options are required",
    "Row 5 [MISSING_ANSWER]: Correct answer is required",
    "Row 7: duplicate question - Exact match (ID: 42)"
  ]
}
```

## Validation Examples

### Valid Question

```json
{
  "question": "What is the capital of France?",
  "option_a": "Lyon",
  "option_b": "Paris",
  "option_c": "Marseille",
  "option_d": "Nice",
  "correct_answer": "B",
  "difficulty": "Easy",
  "domain": "Geography"
}
```

**Validation Result**: ✅ PASS

### Invalid Question (Multiple Errors)

```json
{
  "question": "",
  "option_a": "",
  "option_b": "",
  "option_c": "Marseille",
  "option_d": "Nice",
  "correct_answer": "X"
}
```

**Validation Errors**:
- ❌ `MISSING_QUESTION`: Question text is required
- ❌ `INSUFFICIENT_OPTIONS`: At least 2 options are required (only 2 non-empty)
- ❌ `INVALID_ANSWER_FORMAT`: Correct answer must be A, B, C, or D

**Result**: ❌ REJECTED (not inserted)

### Partially Invalid (Recoverable)

```json
{
  "question": "What is 2+2?",
  "option_a": "3",
  "option_b": "4",
  "option_c": "",
  "option_d": "",
  "correct_answer": "B",
  "explanation": "Basic arithmetic",
  "difficulty": "Easy"
}
```

**Validation Result**: ✅ PASS
**Notes**:
- Options C and D empty (allowed, only 2 required)
- Optional fields included and trimmed
- Ready for insertion

## Performance Notes

### Validation Speed
- Single question: < 1ms
- 1000 questions: < 500ms
- 10000 questions: < 5 seconds

### Database Lookup Speed
- Normalized text hash index: < 1ms per lookup
- Batch of 50 questions: < 100ms total

## Best Practices

### Input Preparation
1. Trim whitespace from question text
2. Ensure all 4 options are provided (if possible)
3. Use consistent answer format (A/B/C/D)
4. Provide difficulty and domain for better filtering

### Format Selection
- **TXT**: Structured documents, human-readable
- **JSON**: Complex data, metadata, best for import
- **CSV**: Tabular data, spreadsheets
- **XLSX**: Excel files, complex formatting
- **PDF**: Scanned documents, text extraction required
- **DOCX**: Word documents, preserves formatting
- **XML**: Structured data, system integration

### Error Handling
1. Review error summary after import
2. Correct validation errors in source file
3. Re-import with fixes
4. Check duplicate IDs if duplicates detected
5. Delete incorrect duplicates if needed

---

**Last Updated**: January 2025
**Version**: 1.0.0

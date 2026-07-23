# Document Import Engine - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React/Vite)                       │
│  - Drag & Drop Upload                                               │
│  - Real-time Progress Tracking                                      │
│  - Import Summary Display                                           │
│  - Question Management UI                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP/REST API
                             │
┌─────────────────────────────┴────────────────────────────────────────┐
│                    Spring Boot 3.3.2 REST API                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Controller Layer                                             │   │
│  │  - DocumentController (upload, import, preview)            │   │
│  │  - QuestionController (CRUD, filtering, stats)             │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
│                         │                                            │
│  ┌──────────────────────┴──────────────────────────────────────┐   │
│  │ Service Layer                                                │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ ImportService                                       │   │   │
│  │  │  - Orchestrates import workflow                    │   │   │
│  │  │  - Batch processing (50 records at a time)        │   │   │
│  │  │  - Error collection & recovery                    │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ QuestionValidationService                          │   │   │
│  │  │  - Validates question text (5-5000 chars)         │   │   │
│  │  │  - Validates options (at least 2, max 2000 chars) │   │   │
│  │  │  - Validates correct answer (A/B/C/D)            │   │   │
│  │  │  - Validates answer references non-empty option  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ DuplicateDetectionService                          │   │   │
│  │  │  - Normalized text comparison                      │   │   │
│  │  │  - Case-insensitive matching                       │   │   │
│  │  │  - Punctuation-agnostic comparison                 │   │   │
│  │  │  - Logs duplicate reasons (ID: X)                 │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ QuestionNormalizationService                       │   │   │
│  │  │  - Normalize text for comparison                   │   │   │
│  │  │  - Remove accents & diacritics                     │   │   │
│  │  │  - Handle HTML entities (&nbsp;, &amp;, etc.)     │   │   │
│  │  │  - Calculate text similarity (Levenshtein)        │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ QuestionService                                    │   │   │
│  │  │  - CRUD operations on questions                    │   │   │
│  │  │  - Filtering by domain/difficulty                 │   │   │
│  │  │  - Statistics and counting                         │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ DocumentService                                    │   │   │
│  │  │  - Manages file upload records                     │   │   │
│  │  │  - Orchestrates parsing & import                  │   │   │
│  │  │  - Text extraction and caching                    │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────┬──────────────────────────────────────────────┘   │
│                │                                                    │
│  ┌─────────────┴──────────────────────────────────────────────┐   │
│  │ Parsing Layer (Strategy Pattern)                           │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ ParsingService                                       │  │   │
│  │  │  - Detects file type by extension                  │  │   │
│  │  │  - Selects appropriate parser strategy             │  │   │
│  │  │  - Routes to specific extractor                    │  │   │
│  │  └─────────────┬────────────────────────────────────────┘  │   │
│  │                │                                             │   │
│  │  ┌─────────────┴────────────────────────────────────────┐  │   │
│  │  │ DocumentExtractor Interface                         │  │   │
│  │  │  parse(MultipartFile): List<ParsedRow>             │  │   │
│  │  └─────────────┬────────────────────────────────────────┘  │   │
│  │                │                                             │   │
│  │  ┌─────┬──────┬──────┬────────┬────────┬───────┬──────┐    │   │
│  │  │     │      │      │        │        │       │      │    │   │
│  │  ▼     ▼      ▼      ▼        ▼        ▼       ▼      ▼    │   │
│  │ TXT  JSON   CSV   XLSX     PDF    DOCX   XML   TSV    │   │
│  │Parser Parser Parser Parser Parser Parser Parser Parser │   │
│  │                                                         │   │
│  │ BufferedReader Jackson OpenCSV POI PDFBox  POI   DOM   OpenCSV
│  │                                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Repository Layer (JPA)                                       │  │
│  │  - QuestionRepository (find, save, exists, batch)           │  │
│  │  - DocumentRepository (document records)                    │  │
│  │  - ImportLogRepository (import audit trail)                │  │
│  └───────────────────────┬──────────────────────────────────────┘  │
│                          │                                            │
└──────────────────────────┼────────────────────────────────────────────┘
                           │
                    PostgreSQL JDBC
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
   ┌─────────────────────────┐    ┌──────────────────────┐
   │   question_bank Table   │    │  document_record Tbl │
   ├─────────────────────────┤    ├──────────────────────┤
   │ id (PK)                 │    │ id (PK)              │
   │ question (TEXT)         │    │ file_name (VARCHAR) │
   │ question_normalized*    │    │ file_type (VARCHAR) │
   │ option_a (TEXT)         │    │ file_size (BIGINT)  │
   │ option_b (TEXT)         │    │ extracted_text (TXT)│
   │ option_c (TEXT)         │    │ uploaded_at (TSTAMP)│
   │ option_d (TEXT)         │    └──────────────────────┘
   │ correct_answer (VARCHAR)│
   │ explanation (TEXT)      │    ┌──────────────────────┐
   │ difficulty (VARCHAR)    │    │  import_log Table    │
   │ domain (VARCHAR)        │    ├──────────────────────┤
   │ created_at (TSTAMP)     │    │ id (PK)              │
   │ updated_at (TSTAMP)     │    │ document_id (FK)     │
   ├─────────────────────────┤    │ total_records        │
   │ Indexes:                │    │ saved_records        │
   │ - question_normalized   │    │ duplicate_records    │
   │ - domain                │    │ failed_records       │
   │ - difficulty            │    │ processing_time_ms   │
   │ - created_at            │    │ processed_at (TSTAMP)│
   │ - updated_at            │    │ errors (TEXT)        │
   └─────────────────────────┘    └──────────────────────┘
```

## Design Patterns Used

### 1. Strategy Pattern (Parsers)
```java
interface DocumentExtractor {
    List<ParsedRow> parse(MultipartFile file);
}

// Implementations: TxtExtractor, JsonExtractor, CsvExtractor, etc.
// ParsingService selects strategy based on file extension
```

**Benefits:**
- Easy to add new file formats
- Each parser is independent and testable
- Runtime strategy selection

### 2. Service Layer Pattern
```
Controller → Service → Repository → Database
```

**Benefits:**
- Separation of concerns
- Business logic centralized
- Transaction management
- Easier to test

### 3. DTO (Data Transfer Object) Pattern
```java
ParsedRow → QuestionDTO → Database → REST Response
```

**Benefits:**
- Decouples internal entities from API responses
- Protects database schema from exposure
- Flexible response formatting

### 4. Batch Processing Pattern
```java
List<Question> batch = new ArrayList<>();
for (ParsedRow row : rows) {
    // Process row
    batch.add(question);
    
    if (batch.size() >= BATCH_SIZE) {
        repository.saveAll(batch);
        batch.clear();
    }
}
repository.saveAll(batch); // Save remaining
```

**Benefits:**
- Efficient database inserts
- Reduces memory usage
- Handles large files gracefully

## Data Flow

### Import Flow

```
1. Upload File
   ↓
2. Detect Extension → Route to Parser
   ↓
3. Extract Text/Rows
   ├─ TXT: BufferedReader + regex parsing
   ├─ JSON: Jackson ObjectMapper
   ├─ CSV: OpenCSV reader
   ├─ XLSX: Apache POI
   ├─ PDF: PDFBox text extraction
   ├─ DOCX: POI XWPF
   └─ XML: DOM parser
   ↓
4. Normalize & Validate
   ├─ Extract fields (question, options, answer)
   ├─ Trim & clean whitespace
   ├─ Validate structure & content
   └─ Build validation errors list
   ↓
5. Check Duplicates
   ├─ Normalize question text
   ├─ Query for normalized text
   ├─ Log duplicate if found
   └─ Skip if duplicate
   ↓
6. Accumulate in Batch (50 records)
   ↓
7. Insert Batch to Database
   ├─ Single transaction
   ├─ Rollback on error
   └─ Clear batch buffer
   ↓
8. Return Import Summary
   ├─ Total records processed
   ├─ Records saved
   ├─ Duplicates found
   ├─ Failures
   ├─ Processing time
   └─ Error details
```

### Query Flow

```
1. API Request → QuestionController
   ↓
2. Route to QuestionService
   ↓
3. Query Repository (with indexes)
   ├─ Find all questions
   ├─ Find by domain
   ├─ Find by difficulty
   └─ Get statistics
   ↓
4. Map Entity to DTO
   ├─ Remove sensitive fields
   ├─ Format response data
   └─ Include metadata
   ↓
5. Return JSON Response
```

## Validation Pipeline

### Question Validation

```
Input: question, optionA, optionB, optionC, optionD, correctAnswer

Step 1: Check question
├─ Is it null/empty? → Error: MISSING_QUESTION
├─ Length < 5? → Error: QUESTION_TOO_SHORT
├─ Length > 5000? → Error: QUESTION_TOO_LONG
└─ Only numbers? → Error: QUESTION_INVALID

Step 2: Check options
├─ Count non-empty options
├─ < 2 options? → Error: INSUFFICIENT_OPTIONS
└─ For each option:
   ├─ Length > 2000? → Error: OPTION_TOO_LONG
   └─ Empty but referenced? → Error: EMPTY_OPTION_REFERENCED

Step 3: Check correct answer
├─ Is it null/empty? → Error: MISSING_ANSWER
├─ Not in [A-D]? → Error: INVALID_ANSWER_FORMAT
└─ References empty option? → Error: INVALID_ANSWER_REFERENCE

Output: List<ValidationError> (empty if valid)
```

## Normalization Algorithm

```
Input: "What is the capital of FRANCE??"

Step 1: Convert to lowercase
→ "what is the capital of france??"

Step 2: Normalize line breaks & whitespace
→ Replace \r\n, \r, \n, \t with space
→ "what is the capital of france??"

Step 3: Remove HTML entities
→ Replace &nbsp;, &amp;, etc.
→ "what is the capital of france??"

Step 4: Remove accents
→ é→e, ñ→n, etc.
→ "what is the capital of france??"

Step 5: Remove punctuation
→ . , ; : ! ? " ' ( ) - – —
→ "what is the capital of france"

Step 6: Collapse multiple spaces
→ Multiple spaces → single space
→ "what is the capital of france"

Step 7: Trim
→ "what is the capital of france"

Output: "what is the capital of france" (normalized)
```

## Duplicate Detection Rules

```
Rule 1: Exact Match (Primary)
├─ Normalize both questions
├─ Compare normalized text
└─ If equal → DUPLICATE

Rule 2: Fuzzy Match (Optional)
├─ Calculate Levenshtein distance
├─ Similarity = 1 - (distance / max_length)
└─ If similarity > threshold → POTENTIAL_DUPLICATE

Duplicate Action:
├─ Skip insertion
├─ Increment duplicate counter
├─ Log original question ID
├─ Continue with next record
└─ Include in error summary
```

## Error Handling Strategy

### Error Categories

1. **Validation Errors** (Continue)
   - Missing fields
   - Invalid format
   - Length violations
   - Action: Log error, skip record

2. **Parsing Errors** (Continue)
   - Malformed JSON
   - Broken PDF
   - Invalid CSV
   - Action: Log error, skip record

3. **Database Errors** (Attempt Retry)
   - Connection pool exhausted
   - Transaction timeout
   - Constraint violation
   - Action: Retry batch or log failure

4. **System Errors** (Stop & Report)
   - Out of memory
   - Disk full
   - File not found
   - Action: Stop import, return partial results

### Error Recovery

```
try {
    processRow(row);
} catch (ValidationException e) {
    errors.add("Row " + i + ": " + e.getMessage());
    // Continue
} catch (DuplicateException e) {
    duplicates++;
    errors.add("Row " + i + ": Duplicate - " + e.getReason());
    // Continue
} catch (DatabaseException e) {
    failures++;
    errors.add("Row " + i + ": Database error - " + e.getMessage());
    // Attempt retry or continue
} catch (Exception e) {
    failures++;
    errors.add("Row " + i + ": Unexpected error - " + e.getMessage());
    // Log and continue
}

return ImportSummary with all collected errors
```

## Performance Optimizations

### Database
- Batch inserts (50 records per batch)
- Hash index on normalized question (exact match lookup)
- Regular indexes on domain, difficulty, timestamps
- Connection pooling (max 20 connections)

### Memory
- Stream processing for large files
- Batch accumulation (not loading all records at once)
- Clear batch buffer after insert

### Caching
- Question normalization cached in DB column
- No explicit cache layer (DB indexes handle it)

## Security Measures

### Input Validation
- File extension whitelist
- File size limits (50MB)
- Content validation before storage
- SQL injection prevention (JPA parameterized queries)

### Database
- Parameterized queries (JPA prevents SQL injection)
- Limited user permissions
- Audit logging (import_log table)
- Transaction isolation

### API
- Input sanitization
- Error message filtering (no sensitive details exposed)
- Rate limiting (configurable)
- CORS configuration

---

**Last Updated**: January 2025
**Version**: 1.0.0

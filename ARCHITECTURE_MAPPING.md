# Architecture Implementation Mapping

## Your Architecture Flow vs. Implementation

```
ADMIN
    │
    ▼
Drag & Drop Upload
    ↓ Maps to: DocumentController.upload()
    │
    ▼
Document Upload Controller
    ↓ Maps to: DocumentController (REST endpoint)
    │
    ▼
Store Original Document
    ↓ Maps to: DocumentService.uploadDocument() → DocumentRepository.save()
    │
    ▼
File Type Identification
    ↓ Maps to: ParsingService.resolveType() (extension-based detection)
    │
    ├─ TXT ─→ TxtParsingAgent (BufferedReader)
    ├─ DOCX ─→ DocxParsingAgent (Apache POI XWPF)
    ├─ PDF ─→ PdfParsingAgent (Apache PDFBox)
    ├─ JSON ─→ JsonParsingAgent (Jackson)
    ├─ CSV ─→ CsvParsingAgent (OpenCSV)
    ├─ XLSX ─→ XlsxParsingAgent (Apache POI)
    ├─ XML ─→ XmlParsingAgent (DOM Parser)
    └─ TSV ─→ TsvParsingAgent (OpenCSV)
    │
    ▼
Common Extraction Engine
    ↓ Maps to: Each parser returns List<ParsedRow>
    ↓         All parsers implement DocumentExtractor interface
    ↓         ParsedRow contains: Map<String, String> columns
    │
    ▼
Question Pattern Matcher
    ↓ Maps to: ImportService.findValue() + ImportService.extractFields()
    ↓         Extracts: question, option_a, option_b, option_c, 
    ↓                   option_d, correct_answer, difficulty, domain
    │
    ▼
Question Validation Engine
    ↓ Maps to: QuestionValidationService.validateQuestion()
    ↓         15+ validation rules:
    ↓         - Question: 5-5000 chars, not only numbers
    ↓         - Options: Min 2, max 2000 chars each
    ↓         - Answer: A/B/C/D format, valid reference
    │
    ▼
Question Normalization Engine
    ↓ Maps to: QuestionNormalizationService.normalize()
    ↓         - Lowercase conversion
    ↓         - Punctuation removal
    ↓         - Accent removal
    ↓         - Whitespace normalization
    │
    ▼
Duplicate Detection Engine
    ↓ Maps to: DuplicateDetectionService.isDuplicate()
    ↓         - Normalized text comparison
    ↓         - Database query by normalized text
    ↓         - Logs original question ID
    │
    ▼
Question Mapping Engine
    ↓ Maps to: ImportService.importRows()
    ↓         - Create Question entity
    ↓         - Set all fields (question, options, answer, metadata)
    ↓         - Set questionNormalized for future lookups
    │
    ▼
PostgreSQL Repository
    ↓ Maps to: QuestionRepository.saveAll() (batch insert)
    ↓         - Batch size: 50 records
    ↓         - Transactional: ACID compliance
    ↓         - Stores to: question_bank table
    │
    ▼
Import Report
    ↓ Maps to: ImportSummary
    ↓         Returns:
    ↓         - totalRecords: 100
    ↓         - savedRecords: 98
    ↓         - duplicateRecords: 1
    ↓         - failedRecords: 1
    ↓         - processingTimeMs: 2345
    ↓         - errors: [list of errors]
    ↓         - duplicateReasons: [list of duplicates]
```

---

## Component Mapping Table

| Architecture Component | Java Implementation | File Location |
|----------------------|---------------------|-----------------|
| ADMIN Upload | Frontend React Component | `src/App.jsx` |
| Drag & Drop | FileInput with drag-drop | `src/App.jsx` |
| Document Upload Controller | `DocumentController.upload()` | `controller/DocumentController.java` |
| Store Original Document | `DocumentService.uploadDocument()` | `service/DocumentService.java` |
| File Type Identification | `ParsingService.resolveType()` | `parser/ParsingService.java` |
| TXT Reader | `TxtParsingAgent.parse()` | `parser/impl/TxtParsingAgent.java` |
| DOCX Reader | `DocxParsingAgent.parse()` | `parser/impl/DocxParsingAgent.java` |
| PDF Reader | `PdfParsingAgent.parse()` | `parser/impl/PdfParsingAgent.java` |
| JSON Reader | `JsonParsingAgent.parse()` | `parser/impl/JsonParsingAgent.java` |
| CSV Reader | `CsvParsingAgent.parse()` | `parser/impl/CsvParsingAgent.java` |
| XLSX Reader | `XlsxParsingAgent.parse()` | `parser/impl/XlsxParsingAgent.java` |
| XML Reader | `XmlParsingAgent.parse()` | `parser/impl/XmlParsingAgent.java` |
| TSV Reader | `TsvParsingAgent.parse()` | `parser/impl/TsvParsingAgent.java` |
| Common Extraction Engine | `DocumentExtractor interface` + `ParsedRow` | `parser/ParsingAgent.java` |
| Question Pattern Matcher | `ImportService.findValue()` | `service/ImportService.java` |
| Question Validation Engine | `QuestionValidationService` | `service/QuestionValidationService.java` |
| Question Normalization Engine | `QuestionNormalizationService` | `service/QuestionNormalizationService.java` |
| Duplicate Detection Engine | `DuplicateDetectionService` | `service/DuplicateDetectionService.java` |
| Question Mapping Engine | `ImportService.importRows()` | `service/ImportService.java` |
| PostgreSQL Repository | `QuestionRepository.saveAll()` | `repository/QuestionRepository.java` |
| Import Report | `ImportSummary` DTO | `dto/ImportSummary.java` |

---

## Detailed Component Descriptions

### 1. ADMIN → Document Upload Controller
```
REST Endpoint: POST /api/documents/upload
Method: DocumentController.upload(MultipartFile file)
Accepts: Any file (TXT, JSON, CSV, XLSX, DOCX, PDF, XML, TSV)
```

### 2. Store Original Document
```
Method: DocumentService.uploadDocument(MultipartFile file)
Action: 
  1. Extract metadata (filename, size)
  2. Extract text (via TextExtractionService)
  3. Save to DocumentRecord entity
  4. Persist to database
Returns: UploadResponse with document ID
```

### 3. File Type Identification
```
Method: ParsingService.resolveType(String filename)
Logic:
  1. Extract extension from filename
  2. Map to SupportedFileType enum:
     - ".txt" → TXT
     - ".json" → JSON
     - ".csv" → CSV
     - ".xlsx" → XLSX
     - ".docx" → DOCX
     - ".pdf" → PDF
     - ".xml" → XML
     - ".tsv" → TSV
  3. Return SupportedFileType
```

### 4. Specific File Readers (Strategy Pattern)
Each reader implements DocumentExtractor interface:

**TxtParsingAgent** (BufferedReader)
```java
- Read file line by line
- Use regex: "(?i)^Question\\s+\\d+.*" to detect question headers
- Use character detection: "ABCD".indexOf(char) for options
- Extract answer using string contains: "answer" keyword
- Return List<ParsedRow> with Map<String, String>
```

**JsonParsingAgent** (Jackson)
```java
- Parse JSON with ObjectMapper
- Check if array or single object
- Extract all fields as Map<String, String>
- Return List<ParsedRow>
```

**PdfParsingAgent** (Apache PDFBox)
```java
- Load PDF with PDFLoader
- Extract text with PDDocument
- Delegate to TxtParsingAgent for structured parsing
- Return List<ParsedRow>
```

### 5. Common Extraction Engine
All parsers return consistent format:
```java
class ParsedRow {
    Map<String, String> columns;  // Key-value pairs
}

// Example:
Map<String, String> = {
    "question" → "What is 2+2?",
    "option_a" → "3",
    "option_b" → "4",
    "option_c" → "5",
    "option_d" → "6",
    "correct_answer" → "B"
}
```

### 6. Question Pattern Matcher
```java
Method: ImportService.findValue(Map<String, String> cols, String... candidates)
Logic:
  1. For each candidate field name (e.g., "question", "q", "text")
  2. Normalize: lowercase, remove spaces/underscores
  3. Find matching key in columns map
  4. Return value
  
Extracts:
  - question (candidates: "question", "q", "text", "que")
  - option_a (candidates: "option_a", "optiona", "a", "option1")
  - option_b, option_c, option_d (similar)
  - correct_answer (candidates: "answer", "ans", "correct_answer")
  - explanation (candidates: "explanation", "exp", "note")
  - difficulty (candidates: "difficulty", "level", "d")
  - domain (candidates: "domain", "category", "subject")
```

### 7. Question Validation Engine
```java
Method: QuestionValidationService.validateQuestion()
Returns: List<ValidationError>

Validation Rules:
  Question Text:
    ✓ Not null/empty
    ✓ Length 5-5000 characters
    ✓ Not only numbers
    
  Options:
    ✓ Minimum 2 non-empty options
    ✓ Each option 1-2000 characters
    
  Correct Answer:
    ✓ Not null/empty
    ✓ Format: A, B, C, or D (case-insensitive)
    ✓ References non-empty option
    
Returns: Empty list if valid, error list if invalid
```

### 8. Question Normalization Engine
```java
Method: QuestionNormalizationService.normalize(String text)
Steps:
  1. Trim whitespace
  2. Convert to lowercase
  3. Normalize line breaks (\r\n, \r, \n → space)
  4. Replace HTML entities (&nbsp;, &amp;, &lt;, etc.)
  5. Remove accents (é → e, ñ → n, etc.)
  6. Remove punctuation (. , ; : ! ? " ' ( ) - – —)
  7. Collapse multiple spaces to single space
  8. Trim again
  
Example:
  Input:  "What is the capital of FRANCE??"
  Output: "what is the capital of france"
```

### 9. Duplicate Detection Engine
```java
Method: DuplicateDetectionService.isDuplicate(String question)
Logic:
  1. Normalize input question
  2. Query database: QuestionRepository.countByQuestionNormalized(normalized)
  3. If count > 0: DUPLICATE
  4. Log original question ID
  
Performance: O(1) with hash index on normalized text
```

### 10. Question Mapping Engine
```java
Method: ImportService.importRows(List<ParsedRow> rows)
For each row:
  1. Extract all fields using Pattern Matcher
  2. Validate using Validation Engine
  3. Skip if validation errors
  4. Normalize question using Normalization Engine
  5. Check duplicates using Duplicate Detection Engine
  6. Skip if duplicate (log reason)
  7. Create Question entity:
     - question
     - optionA, optionB, optionC, optionD
     - correctAnswer
     - explanation
     - difficulty
     - domain
     - questionNormalized (for future lookups)
     - createdAt, updatedAt (timestamps)
  8. Add to batch buffer
  9. If batch size >= 50: flush to database
  10. After processing all: flush remaining batch

Returns: ImportSummary with statistics
```

### 11. PostgreSQL Repository (Batch Insert)
```java
Method: QuestionRepository.saveAll(List<Question> questions)
Action:
  1. Begin transaction
  2. Insert 50 questions at once (batch)
  3. Commit transaction
  4. Clear batch buffer
  
Performance:
  - Single transaction per batch
  - JDBC batch_size: 50
  - Optimized for bulk insert
```

### 12. Import Report
```java
class ImportSummary {
    int totalRecords;           // 100
    int savedRecords;           // 98
    int duplicateRecords;       // 1
    int failedRecords;          // 1
    long processingTimeMs;      // 2345
    LocalDateTime processedAt;  // Timestamp
    List<String> errors;        // Error messages
    List<String> duplicateReasons; // Duplicate details
}
```

---

## Data Flow Example

### Input: JSON File with 3 Questions

```json
[
  {"question": "What is 2+2?", "option_a": "3", "option_b": "4", "option_c": "5", "option_d": "6", "correct_answer": "B"},
  {"question": "What is 2+2?", "option_a": "3", "option_b": "4", "option_c": "5", "option_d": "6", "correct_answer": "B"},
  {"question": "Invalid"}
]
```

### Processing Flow

```
1. File Upload Controller receives file
   ↓
2. Store Original → DocumentRecord saved with ID=1
   ↓
3. File Type ID → Detect ".json" → Route to JsonParsingAgent
   ↓
4. JSON Reader → Parse 3 objects → Return List<ParsedRow>
   ↓
5. Pattern Matcher → Extract fields:
   Row 1: {question="What is 2+2?", option_a="3", option_b="4", ...}
   Row 2: {question="What is 2+2?", option_a="3", option_b="4", ...}
   Row 3: {question="Invalid"}
   ↓
6. Validation Engine:
   Row 1: ✅ Valid (all fields present)
   Row 2: ✅ Valid (all fields present)
   Row 3: ❌ Invalid (missing options, answer)
   ↓
7. Normalization Engine:
   Row 1: "What is 2+2?" → "what is 2+2"
   Row 2: "What is 2+2?" → "what is 2+2"
   ↓
8. Duplicate Detection:
   Row 1: Query → Not found → SAVE
   Row 2: Query → Found (Row 1) → DUPLICATE (skip, log ID=1)
   ↓
9. Question Mapping:
   Row 1: Create Question entity, add to batch
   Row 2: Skip (duplicate)
   Row 3: Skip (validation error)
   ↓
10. Batch Insert:
    - 1 question in batch
    - Flush to PostgreSQL
    - Insert: INSERT INTO question_bank VALUES (...)
    ↓
11. Import Report:
    {
      "totalRecords": 3,
      "savedRecords": 1,
      "duplicateRecords": 1,
      "failedRecords": 1,
      "processingTimeMs": 145,
      "errors": [
        "Row 2: duplicate question - Exact match (ID: 1)",
        "Row 3 [INSUFFICIENT_OPTIONS]: At least 2 options are required"
      ]
    }
```

---

## Verification Checklist

- ✅ Each architecture component has Java implementation
- ✅ All 8 file readers implemented (TXT, JSON, CSV, XLSX, DOCX, PDF, XML, TSV)
- ✅ Common extraction engine (ParsedRow + DocumentExtractor interface)
- ✅ Pattern matcher (flexible field detection)
- ✅ Validation engine (15+ rules)
- ✅ Normalization engine (text cleaning)
- ✅ Duplicate detection engine (normalized comparison)
- ✅ Mapping engine (entity creation)
- ✅ Batch repository (saveAll() with batch size)
- ✅ Import report (detailed summary)
- ✅ Transaction management (ACID compliance)
- ✅ Error handling (continue on error, partial success)

**Status**: ✅ **Architecture fully implemented**

---

**Last Updated**: July 23, 2026  
**Architecture Version**: 1.0.0  
**Implementation Status**: Complete

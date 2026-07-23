# Logic-Based Architecture (Zero AI, Pure Deterministic Logic)

## ✅ Clarification: What Uses "Logic" vs "Libraries"

### Pure Deterministic Logic (NO AI/ML)
```
1. File Type Detection → Pure string matching (extension check)
2. Question Pattern Matching → Pure string operations (field lookup)
3. Validation → Pure conditional logic (value checks)
4. Normalization → Pure string manipulation (trim, lowercase, regex)
5. Duplicate Detection → Pure text comparison (hash lookup)
6. Storage → Pure database inserts (SQL execution)
```

### Standard Parsing Libraries (NOT AI - Just Structural Parsing)
```
These are deterministic library parsers for different formats:
- JSON → Jackson (parses JSON structure)
- CSV → OpenCSV (parses CSV lines)
- Excel → Apache POI (parses Excel cells)
- PDF → PDFBox (extracts text)
- Word → Apache POI (extracts paragraphs)
- XML → DOM Parser (parses XML nodes)
```

**Important**: These libraries are **NOT AI/ML** - they're standard format parsers that deterministically extract data based on format rules.

---

## 📋 Complete Logic Flow for Data Storage

### Step 1: File Type Detection (Pure Logic - No Library)
```java
// PURE LOGIC - No external library
String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

// Deterministic mapping
if (extension.equals("json"))      → JsonParsingAgent
if (extension.equals("txt"))       → TxtParsingAgent
if (extension.equals("csv"))       → CsvParsingAgent
if (extension.equals("xlsx"))      → XlsxParsingAgent
if (extension.equals("docx"))      → DocxParsingAgent
if (extension.equals("pdf"))       → PdfParsingAgent
if (extension.equals("xml"))       → XmlParsingAgent
if (extension.equals("tsv"))       → TsvParsingAgent

// Result: ParsingAgent selected (no AI involved)
```

### Step 2: Question Pattern Matching (Pure Logic)
```java
// PURE LOGIC - No external library for this
Map<String, String> findValue(Map<String, String> cols, String... candidates) {
    for (String candidate : candidates) {
        String normalized = candidate.toLowerCase().replaceAll("[_\\s-]", "");
        
        for (Map.Entry<String, String> entry : cols.entrySet()) {
            String key = entry.getKey().toLowerCase().replaceAll("[_\\s-]", "");
            
            if (key.equals(normalized)) {
                return entry.getValue();  // FOUND
            }
        }
    }
    return null;  // NOT FOUND
}

// Usage - PURE LOGIC
String question = findValue(cols, "question", "q", "text", "que");
String answer = findValue(cols, "answer", "ans", "correct_answer");
String optionA = findValue(cols, "option_a", "optiona", "a", "option1");
// ... and so on

// Result: Fields extracted using pure string matching logic
```

### Step 3: Validation (Pure Logic - 15+ Rules)
```java
// PURE LOGIC - No AI
List<ValidationError> validateQuestion(String question, String optA, String optB, String optC, String optD, String answer) {
    List<ValidationError> errors = new ArrayList<>();
    
    // Rule 1: Question not null
    if (question == null || question.isBlank()) {
        errors.add(new ValidationError("MISSING_QUESTION", "Question required"));
    }
    
    // Rule 2: Question length 5-5000
    if (question.length() < 5) {
        errors.add(new ValidationError("QUESTION_TOO_SHORT", "Min 5 chars"));
    }
    if (question.length() > 5000) {
        errors.add(new ValidationError("QUESTION_TOO_LONG", "Max 5000 chars"));
    }
    
    // Rule 3: Question not only numbers
    if (question.replaceAll("\\d", "").replaceAll("\\s", "").isEmpty()) {
        errors.add(new ValidationError("QUESTION_INVALID", "Cannot be only numbers"));
    }
    
    // Rule 4-7: Options validation
    long nonEmptyOptions = Stream.of(optA, optB, optC, optD)
        .filter(o -> o != null && !o.isBlank())
        .count();
    
    if (nonEmptyOptions < 2) {
        errors.add(new ValidationError("INSUFFICIENT_OPTIONS", "Min 2 options"));
    }
    
    // Rule 8-11: Option length checks
    if (optA != null && optA.length() > 2000) {
        errors.add(new ValidationError("OPTION_A_TOO_LONG", "Max 2000 chars"));
    }
    // ... similar for optB, optC, optD
    
    // Rule 12-14: Answer validation
    if (answer == null || answer.isBlank()) {
        errors.add(new ValidationError("MISSING_ANSWER", "Answer required"));
    }
    
    if (!answer.matches("[A-Da-d]")) {
        errors.add(new ValidationError("INVALID_ANSWER_FORMAT", "Must be A/B/C/D"));
    }
    
    // Rule 15: Answer references valid option
    int answerIndex = answer.toUpperCase().charAt(0) - 'A';
    List<String> options = Arrays.asList(optA, optB, optC, optD);
    if (options.get(answerIndex) == null || options.get(answerIndex).isBlank()) {
        errors.add(new ValidationError("INVALID_ANSWER_REF", "References empty option"));
    }
    
    return errors;  // PURE LOGIC - No AI
}
```

### Step 4: Normalization (Pure Logic)
```java
// PURE LOGIC - String manipulation only
String normalize(String text) {
    if (text == null || text.isBlank()) return "";
    
    // Step 1: Trim
    text = text.trim();
    
    // Step 2: Lowercase
    text = text.toLowerCase();
    
    // Step 3: Normalize line breaks
    text = text.replaceAll("\\r\\n|\\r|\\n", " ");
    
    // Step 4: Normalize HTML entities
    text = text.replaceAll("&nbsp;", " ");
    text = text.replaceAll("&amp;", "&");
    text = text.replaceAll("&lt;", "<");
    text = text.replaceAll("&gt;", ">");
    
    // Step 5: Remove accents
    String nfd = Normalizer.normalize(text, Normalizer.Form.NFD);
    text = nfd.replaceAll("[^\\p{ASCII}]", "");
    
    // Step 6: Remove punctuation
    text = text.replaceAll("[.,;:!?\"'()\\-–—]", "");
    
    // Step 7: Collapse spaces
    text = text.replaceAll("\\s+", " ");
    
    // Step 8: Trim again
    text = text.trim();
    
    return text;  // PURE LOGIC - No AI
}

// Example
Input:  "What is the capital of FRANCE??"
Output: "what is the capital of france"
```

### Step 5: Duplicate Detection (Pure Logic)
```java
// PURE LOGIC - Text comparison and database query
boolean isDuplicate(String question) {
    if (question == null || question.isBlank()) {
        return false;
    }
    
    // Step 1: Normalize question
    String normalized = normalize(question);
    
    // Step 2: Query database (pure SQL)
    long count = questionRepository.countByQuestionNormalized(normalized);
    
    // Step 3: Logic check
    return count > 0;  // PURE LOGIC
}

// The database query is pure SQL:
// SELECT COUNT(*) FROM question_bank WHERE question_normalized = ?

// Example
Input:  "What is the capital of France?"
Norm:   "what is the capital of france"
Query:  SELECT COUNT(*) FROM question_bank WHERE question_normalized = 'what is the capital of france'
Result: 0 (not duplicate)
```

### Step 6: Storage (Pure Database Logic)
```java
// PURE LOGIC - Entity creation and batch insertion
@Transactional
ImportSummary importRows(List<ParsedRow> rows) {
    List<Question> batch = new ArrayList<>();
    int saved = 0, duplicates = 0, failed = 0;
    List<String> errors = new ArrayList<>();
    
    for (int i = 0; i < rows.size(); i++) {
        ParsedRow row = rows.get(i);
        
        try {
            // Step 1: Extract fields (pure logic)
            String question = findValue(row.columns(), "question", "q", "text");
            String optA = findValue(row.columns(), "option_a", "a", "option1");
            String optB = findValue(row.columns(), "option_b", "b", "option2");
            String optC = findValue(row.columns(), "option_c", "c", "option3");
            String optD = findValue(row.columns(), "option_d", "d", "option4");
            String answer = findValue(row.columns(), "answer", "ans", "correct_answer");
            String difficulty = findValue(row.columns(), "difficulty", "level");
            String domain = findValue(row.columns(), "domain", "subject");
            
            // Step 2: Validate (pure logic)
            List<ValidationError> validationErrors = validateQuestion(question, optA, optB, optC, optD, answer);
            if (!validationErrors.isEmpty()) {
                errors.add("Row " + (i+1) + ": validation failed");
                failed++;
                continue;
            }
            
            // Step 3: Check duplicate (pure logic)
            if (isDuplicate(question)) {
                duplicates++;
                errors.add("Row " + (i+1) + ": duplicate skipped");
                continue;
            }
            
            // Step 4: Create entity (pure logic)
            Question q = new Question(
                question,
                optA,
                optB,
                optC,
                optD,
                answer,
                explanation,
                difficulty,
                domain
            );
            
            // Step 5: Set normalized text (pure logic)
            q.setQuestionNormalized(normalize(question));
            
            // Step 6: Add to batch (pure logic)
            batch.add(q);
            saved++;
            
            // Step 7: Flush batch when full (pure logic)
            if (batch.size() >= 50) {
                questionRepository.saveAll(batch);  // Single transaction
                batch.clear();
            }
            
        } catch (Exception ex) {
            errors.add("Row " + (i+1) + ": " + ex.getMessage());
            failed++;
        }
    }
    
    // Step 8: Flush remaining (pure logic)
    if (!batch.isEmpty()) {
        questionRepository.saveAll(batch);
    }
    
    // Step 9: Return summary (pure logic)
    return new ImportSummary(
        rows.size(),        // total
        saved,              // saved
        duplicates,         // duplicates
        failed,             // failed
        processingTimeMs,   // time
        LocalDateTime.now(), // timestamp
        errors,             // error list
        duplicateReasons    // duplicate reasons
    );
    // PURE LOGIC - No AI involved
}
```

---

## 🎯 What Each Step Does (Pure Logic Only)

| Step | Input | Logic | Output |
|------|-------|-------|--------|
| 1. Type Detection | Filename | Extension matching | ParsingAgent type |
| 2. Field Matching | Map<String, String> | String comparison | Extracted fields |
| 3. Validation | Fields | Conditional checks (15+ rules) | Errors list |
| 4. Normalization | Question text | String manipulation | Normalized text |
| 5. Duplicate Check | Normalized text | Database query count | Boolean (duplicate?) |
| 6. Storage | Valid questions | Batch insert SQL | Question IDs |
| 7. Report | Statistics | Summary calculation | ImportSummary |

---

## ✅ Libraries Used (Deterministic, Not AI)

### Format Parsing (Deterministic - NOT AI)
- **Jackson** (JSON) - Parses JSON structure deterministically
- **OpenCSV** (CSV) - Parses CSV lines deterministically
- **Apache POI** (Excel/Word) - Parses cells/paragraphs deterministically
- **Apache PDFBox** (PDF) - Extracts text deterministically
- **DOM Parser** (XML) - Parses XML nodes deterministically

### Storage (Deterministic - NOT AI)
- **Spring Data JPA** - ORM framework (standard data persistence)
- **PostgreSQL** - Database (standard data storage)
- **HikariCP** - Connection pooling (standard pool management)

### Utilities (Deterministic - NOT AI)
- **SLF4J** (Logging) - Standard logging framework
- **Spring Security** - Standard security framework
- **Jackson** (JSON serialization) - Standard JSON framework

**None of these involve AI, ML, or LLM** - all are standard, deterministic libraries.

---

## 🔐 Security (Pure Logic)

### Authentication (Pure Logic)
```java
// PURE LOGIC - Check username/password
UserDetails loadUserByUsername(String username) {
    // Load from environment variable
    String storedPassword = env.getVariable("ADMIN_PASSWORD");
    
    // Compare using BCrypt
    if (passwordEncoder.matches(inputPassword, storedPassword)) {
        return new User(username, storedPassword, "ADMIN");
    }
    throw new AuthenticationException();  // PURE LOGIC
}
```

### Authorization (Pure Logic)
```java
// PURE LOGIC - Check if user has role
@PreAuthorize("hasRole('ADMIN')")
public void deleteQuestion(Long id) {
    // Only users with ADMIN role can execute
    // PURE LOGIC - No AI
}
```

---

## ✨ Summary: What Uses Logic vs. Libraries

### Pure Logic (100% Custom Implementation)
✅ File type detection  
✅ Field pattern matching  
✅ Question validation (15+ rules)  
✅ Text normalization  
✅ Duplicate detection  
✅ Batch processing  
✅ Error handling  
✅ Authentication  
✅ Authorization  
✅ Reporting  

### Standard Libraries (Deterministic, Not AI)
✅ JSON parsing (Jackson)  
✅ CSV parsing (OpenCSV)  
✅ Excel parsing (Apache POI)  
✅ PDF text extraction (PDFBox)  
✅ XML parsing (DOM Parser)  
✅ Database (PostgreSQL)  
✅ ORM (Spring JPA)  

### Zero AI/LLM
❌ No OpenAI  
❌ No Google Gemini  
❌ No Claude API  
❌ No LangChain  
❌ No OCR AI  
❌ No NLP models  
❌ No machine learning  
❌ No artificial intelligence  

---

**Status**: ✅ **100% LOGIC-BASED SYSTEM (ZERO AI)**

All data extraction, validation, normalization, duplicate detection, and storage use **pure deterministic logic only**.

---

**Last Updated**: July 23, 2026  
**Architecture Type**: Logic-Based (Deterministic, Rule-Driven)  
**AI/LLM Usage**: NONE

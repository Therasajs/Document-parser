package com.example.documentai.service;

import com.example.documentai.dto.ImportSummary;
import com.example.documentai.dto.ValidationError;
import com.example.documentai.entity.Question;
import com.example.documentai.parser.ParsedRow;
import com.example.documentai.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ImportService {

    private final QuestionRepository questionRepository;
    private final QuestionValidationService validationService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final QuestionNormalizationService normalizationService;
    private static final int BATCH_SIZE = 50;

    public ImportService(QuestionRepository questionRepository,
                        QuestionValidationService validationService,
                        DuplicateDetectionService duplicateDetectionService,
                        QuestionNormalizationService normalizationService) {
        this.questionRepository = questionRepository;
        this.validationService = validationService;
        this.duplicateDetectionService = duplicateDetectionService;
        this.normalizationService = normalizationService;
    }

    @Transactional
    public ImportSummary importRows(List<ParsedRow> rows) {
        long startTime = System.currentTimeMillis();
        int total = rows.size();
        int saved = 0;
        int duplicates = 0;
        List<String> errors = new ArrayList<>();
        List<String> duplicateReasons = new ArrayList<>();
        List<Question> batchQuestions = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            ParsedRow row = rows.get(i);
            Map<String, String> cols = row.columns();
            try {
                String question = findValue(cols, "question", "q", "text", "que");
                String optionA = findValue(cols, "option_a", "optiona", "a", "option1");
                String optionB = findValue(cols, "option_b", "optionb", "b", "option2");
                String optionC = findValue(cols, "option_c", "optionc", "c", "option3");
                String optionD = findValue(cols, "option_d", "optiond", "d", "option4");
                String correctAnswer = findValue(cols, "answer", "ans", "correct_answer", "correctanswer", "correct ans");
                String explanation = findValue(cols, "explanation", "exp", "note", "remark");
                String difficulty = findValue(cols, "difficulty", "level", "d");
                String domain = findValue(cols, "domain", "category", "subject", "topic");

                List<ValidationError> validationErrors = validationService.validateQuestion(
                    question, optionA, optionB, optionC, optionD, correctAnswer
                );

                if (!validationErrors.isEmpty()) {
                    for (ValidationError error : validationErrors) {
                        errors.add("Row " + (i + 1) + " [" + error.code() + "]: " + error.message());
                    }
                    continue;
                }

                if (duplicateDetectionService.isDuplicate(question)) {
                    String reason = duplicateDetectionService.getDuplicateDetectionReason(question);
                    duplicates++;
                    String duplicateMsg = "Row " + (i + 1) + ": duplicate question - " + reason;
                    errors.add(duplicateMsg);
                    duplicateReasons.add(duplicateMsg);
                    continue;
                }

                Question q = new Question(
                    question,
                    optionA != null ? optionA.trim() : null,
                    optionB != null ? optionB.trim() : null,
                    optionC != null ? optionC.trim() : null,
                    optionD != null ? optionD.trim() : null,
                    correctAnswer != null ? correctAnswer.trim().toUpperCase() : null,
                    explanation != null ? explanation.trim() : null,
                    difficulty != null ? difficulty.trim() : null,
                    domain != null ? domain.trim() : null
                );

                q.setQuestionNormalized(normalizationService.normalizeForStorage(question));
                batchQuestions.add(q);
                saved++;

                if (batchQuestions.size() >= BATCH_SIZE) {
                    questionRepository.saveAll(batchQuestions);
                    batchQuestions.clear();
                }

            } catch (Exception ex) {
                errors.add("Row " + (i + 1) + ": " + (ex.getMessage() != null ? ex.getMessage() : "Unknown error"));
            }
        }

        if (!batchQuestions.isEmpty()) {
            questionRepository.saveAll(batchQuestions);
        }

        long processingTime = System.currentTimeMillis() - startTime;

        return new ImportSummary(
            total,
            saved,
            duplicates,
            errors.size() - duplicates,
            processingTime,
            LocalDateTime.now(),
            errors,
            duplicateReasons
        );
    }

    private String findValue(Map<String, String> cols, String... candidates) {
        for (String cand : candidates) {
            String normalizedCand = normalize(cand);
            for (Map.Entry<String, String> e : cols.entrySet()) {
                if (e.getKey() == null) continue;
                String normalizedKey = normalize(e.getKey());
                if (normalizedKey.equals(normalizedCand)) {
                    String value = e.getValue();
                    return (value != null && !value.isBlank()) ? value : null;
                }
            }
        }
        return null;
    }

    private String normalize(String str) {
        if (str == null) return "";
        return str.toLowerCase()
                .replaceAll("[_\\s-]", "")
                .trim();
    }
}

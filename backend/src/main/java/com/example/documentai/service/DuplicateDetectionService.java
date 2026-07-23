package com.example.documentai.service;

import com.example.documentai.repository.QuestionRepository;
import org.springframework.stereotype.Service;

@Service
public class DuplicateDetectionService {

    private final QuestionRepository questionRepository;
    private final QuestionNormalizationService normalizationService;

    public DuplicateDetectionService(QuestionRepository questionRepository, QuestionNormalizationService normalizationService) {
        this.questionRepository = questionRepository;
        this.normalizationService = normalizationService;
    }

    public boolean isDuplicate(String question) {
        if (question == null || question.isBlank()) {
            return false;
        }

        String normalized = normalizationService.normalizeForComparison(question);
        return questionRepository.countByQuestionNormalized(normalized) > 0;
    }

    public boolean isDuplicateWithTolerance(String question, double similarityThreshold) {
        if (question == null || question.isBlank()) {
            return false;
        }

        String normalized = normalizationService.normalizeForComparison(question);

        var existingQuestion = questionRepository.findByQuestionNormalized(normalized);
        if (existingQuestion.isPresent()) {
            return true;
        }

        return false;
    }

    public String getDuplicateDetectionReason(String question) {
        if (question == null || question.isBlank()) {
            return "Question is empty";
        }

        String normalized = normalizationService.normalizeForComparison(question);
        var existingQuestion = questionRepository.findByQuestionNormalized(normalized);

        if (existingQuestion.isPresent()) {
            return "Exact match after normalization (ID: " + existingQuestion.get().getId() + ")";
        }

        return null;
    }
}

package com.example.documentai.service;

import com.example.documentai.dto.ValidationError;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class QuestionValidationService {

    private static final Pattern VALID_ANSWER_PATTERN = Pattern.compile("^[A-Da-d]$");
    private static final int MIN_QUESTION_LENGTH = 5;
    private static final int MAX_QUESTION_LENGTH = 5000;
    private static final int MIN_OPTION_LENGTH = 1;
    private static final int MAX_OPTION_LENGTH = 2000;

    public List<ValidationError> validateQuestion(String question, String optionA, String optionB, String optionC, String optionD, String correctAnswer) {
        List<ValidationError> errors = new ArrayList<>();

        errors.addAll(validateQuestion(question));
        errors.addAll(validateOptions(optionA, optionB, optionC, optionD));
        errors.addAll(validateCorrectAnswer(correctAnswer, optionA, optionB, optionC, optionD));

        return errors;
    }

    private List<ValidationError> validateQuestion(String question) {
        List<ValidationError> errors = new ArrayList<>();

        if (question == null || question.isBlank()) {
            errors.add(new ValidationError("MISSING_QUESTION", "Question text is required"));
            return errors;
        }

        String trimmed = question.trim();

        if (trimmed.length() < MIN_QUESTION_LENGTH) {
            errors.add(new ValidationError("QUESTION_TOO_SHORT", "Question must be at least " + MIN_QUESTION_LENGTH + " characters"));
        }

        if (trimmed.length() > MAX_QUESTION_LENGTH) {
            errors.add(new ValidationError("QUESTION_TOO_LONG", "Question cannot exceed " + MAX_QUESTION_LENGTH + " characters"));
        }

        if (containsOnlyNumbers(trimmed)) {
            errors.add(new ValidationError("QUESTION_INVALID", "Question cannot contain only numbers"));
        }

        return errors;
    }

    private List<ValidationError> validateOptions(String optionA, String optionB, String optionC, String optionD) {
        List<ValidationError> errors = new ArrayList<>();

        List<String> options = List.of(optionA, optionB, optionC, optionD);
        long nonEmptyCount = options.stream().filter(o -> o != null && !o.isBlank()).count();

        if (nonEmptyCount < 2) {
            errors.add(new ValidationError("INSUFFICIENT_OPTIONS", "At least 2 options are required"));
            return errors;
        }

        for (int i = 0; i < options.size(); i++) {
            String option = options.get(i);
            char label = (char) ('A' + i);

            if (option != null && !option.isBlank()) {
                String trimmed = option.trim();

                if (trimmed.length() < MIN_OPTION_LENGTH) {
                    errors.add(new ValidationError("OPTION_" + label + "_EMPTY", "Option " + label + " is empty"));
                }

                if (trimmed.length() > MAX_OPTION_LENGTH) {
                    errors.add(new ValidationError("OPTION_" + label + "_TOO_LONG", "Option " + label + " exceeds " + MAX_OPTION_LENGTH + " characters"));
                }
            }
        }

        return errors;
    }

    private List<ValidationError> validateCorrectAnswer(String correctAnswer, String optionA, String optionB, String optionC, String optionD) {
        List<ValidationError> errors = new ArrayList<>();

        if (correctAnswer == null || correctAnswer.isBlank()) {
            errors.add(new ValidationError("MISSING_ANSWER", "Correct answer is required"));
            return errors;
        }

        String trimmed = correctAnswer.trim().toUpperCase();

        if (!VALID_ANSWER_PATTERN.matcher(trimmed).matches()) {
            errors.add(new ValidationError("INVALID_ANSWER_FORMAT", "Correct answer must be A, B, C, or D"));
            return errors;
        }

        List<String> options = List.of(optionA, optionB, optionC, optionD);
        int answerIndex = trimmed.charAt(0) - 'A';

        if (answerIndex >= 0 && answerIndex < options.size()) {
            String selectedOption = options.get(answerIndex);
            if (selectedOption == null || selectedOption.isBlank()) {
                errors.add(new ValidationError("INVALID_ANSWER_REFERENCE", "Correct answer references an empty option"));
            }
        }

        return errors;
    }

    private boolean containsOnlyNumbers(String text) {
        return text.replaceAll("\\d", "").replaceAll("\\s", "").isEmpty();
    }

    public boolean isValid(String question, String optionA, String optionB, String optionC, String optionD, String correctAnswer) {
        return validateQuestion(question, optionA, optionB, optionC, optionD, correctAnswer).isEmpty();
    }
}

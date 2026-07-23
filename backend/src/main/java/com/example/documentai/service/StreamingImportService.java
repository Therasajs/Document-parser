package com.example.documentai.service;

import com.example.documentai.entity.Question;
import com.example.documentai.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class StreamingImportService {

    private final QuestionRepository questionRepository;

    public StreamingImportService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Transactional
    public Mono<ImportResult> importRowsStream(Flux<Map<String, String>> rowsFlux) {
        return rowsFlux
                .flatMap(this::processRow)
                .collectList()
                .map(results -> {
                    int total = results.size();
                    long saved = results.stream().filter(ImportRowResult::isSuccess).count();
                    var errors = results.stream()
                            .filter(r -> !r.isSuccess())
                            .map(ImportRowResult::getError)
                            .toList();
                    return new ImportResult(total, (int) saved, errors);
                });
    }

    private Mono<ImportRowResult> processRow(Map<String, String> cols) {
        return Mono.fromCallable(() -> {
            String question = findValue(cols, "question", "q", "text");
            if (question == null || question.isBlank()) {
                return new ImportRowResult(false, "Missing question");
            }

            String optionA = findValue(cols, "option_a", "optiona", "a");
            String optionB = findValue(cols, "option_b", "optionb", "b");
            String optionC = findValue(cols, "option_c", "optionc", "c");
            String optionD = findValue(cols, "option_d", "optiond", "d");

            if ((optionA == null || optionA.isBlank()) &&
                (optionB == null || optionB.isBlank()) &&
                (optionC == null || optionC.isBlank()) &&
                (optionD == null || optionD.isBlank())) {
                return new ImportRowResult(false, "Missing all options");
            }

            String correctAnswer = findValue(cols, "answer", "ans", "correct_answer");
            if (correctAnswer == null || correctAnswer.isBlank()) {
                return new ImportRowResult(false, "Missing correct answer");
            }

            if (questionRepository.existsByQuestion(question)) {
                return new ImportRowResult(false, "Duplicate question skipped");
            }

            Question q = new Question(question, optionA, optionB, optionC, optionD, correctAnswer);
            questionRepository.save(q);
            return new ImportRowResult(true, null);
        });
    }

    private String findValue(Map<String, String> cols, String... candidates) {
        for (String cand : candidates) {
            for (Map.Entry<String, String> e : cols.entrySet()) {
                if (e.getKey() == null) continue;
                if (e.getKey().equalsIgnoreCase(cand)) {
                    String value = e.getValue();
                    return (value != null && !value.isBlank()) ? value : null;
                }
            }
        }
        return null;
    }

    public record ImportResult(int totalRecords, int savedRecords, java.util.List<String> errors) {}

    private record ImportRowResult(boolean success, String error) {
        boolean isSuccess() {
            return success;
        }

        String getError() {
            return error;
        }
    }
}

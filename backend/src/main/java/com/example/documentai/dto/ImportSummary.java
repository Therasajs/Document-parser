package com.example.documentai.dto;

import java.util.List;
import java.time.LocalDateTime;

public record ImportSummary(
    int totalRecords,
    int savedRecords,
    int duplicateRecords,
    int failedRecords,
    long processingTimeMs,
    LocalDateTime processedAt,
    List<String> errors,
    List<String> duplicateReasons
) {
    public ImportSummary(int total, int saved, List<String> errors) {
        this(total, saved, 0, total - saved, 0, LocalDateTime.now(), errors, List.of());
    }
}

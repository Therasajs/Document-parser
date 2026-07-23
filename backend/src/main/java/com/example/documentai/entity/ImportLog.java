package com.example.documentai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "import_log", indexes = {
    @Index(name = "idx_import_document_id", columnList = "document_id"),
    @Index(name = "idx_import_processed_at", columnList = "processed_at")
})
public class ImportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "total_records")
    private int totalRecords;

    @Column(name = "saved_records")
    private int savedRecords;

    @Column(name = "duplicate_records")
    private int duplicateRecords;

    @Column(name = "failed_records")
    private int failedRecords;

    @Column(name = "processing_time_ms")
    private long processingTimeMs;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @Column(columnDefinition = "TEXT")
    private String errors;

    public ImportLog() {
        this.processedAt = LocalDateTime.now();
    }

    public ImportLog(Long documentId, int totalRecords, int savedRecords, int duplicateRecords, int failedRecords, long processingTimeMs, String errors) {
        this.documentId = documentId;
        this.totalRecords = totalRecords;
        this.savedRecords = savedRecords;
        this.duplicateRecords = duplicateRecords;
        this.failedRecords = failedRecords;
        this.processingTimeMs = processingTimeMs;
        this.errors = errors;
        this.processedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public int getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(int totalRecords) {
        this.totalRecords = totalRecords;
    }

    public int getSavedRecords() {
        return savedRecords;
    }

    public void setSavedRecords(int savedRecords) {
        this.savedRecords = savedRecords;
    }

    public int getDuplicateRecords() {
        return duplicateRecords;
    }

    public void setDuplicateRecords(int duplicateRecords) {
        this.duplicateRecords = duplicateRecords;
    }

    public int getFailedRecords() {
        return failedRecords;
    }

    public void setFailedRecords(int failedRecords) {
        this.failedRecords = failedRecords;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public String getErrors() {
        return errors;
    }

    public void setErrors(String errors) {
        this.errors = errors;
    }
}

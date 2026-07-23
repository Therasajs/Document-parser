package com.example.documentai.dto;

import java.time.Instant;

public record DocumentResponse(Long id, String fileName, String fileType, Long fileSize, String extractedText, Instant uploadedAt) {
}

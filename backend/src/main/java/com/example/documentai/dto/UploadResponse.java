package com.example.documentai.dto;

import java.time.Instant;

public record UploadResponse(Long id, String fileName, String fileType, Long fileSize, Instant uploadedAt) {
}

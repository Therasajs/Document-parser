package com.example.documentai.service;

import com.example.documentai.dto.DocumentResponse;
import com.example.documentai.dto.ImportSummary;
import com.example.documentai.dto.UploadResponse;
import com.example.documentai.entity.DocumentRecord;
import com.example.documentai.parser.TextExtractionService;
import com.example.documentai.parser.ParsingService;
import com.example.documentai.service.ImportService;
import com.example.documentai.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final TextExtractionService textExtractionService;
    private final ParsingService parsingService;
    private final ImportService importService;
    private ImportSummary latestImportSummary = new ImportSummary(0, 0, List.of());

    public DocumentService(DocumentRepository documentRepository, TextExtractionService textExtractionService, ParsingService parsingService, ImportService importService) {
        this.documentRepository = documentRepository;
        this.textExtractionService = textExtractionService;
        this.parsingService = parsingService;
        this.importService = importService;
    }

    @Transactional
    public UploadResponse uploadDocument(MultipartFile file) {
        String extractedText = textExtractionService.extractText(file);
        DocumentRecord saved = documentRepository.save(new DocumentRecord(
                file.getOriginalFilename(),
                detectFileType(file.getOriginalFilename()),
                file.getSize(),
                extractedText,
                Instant.now()
        ));
        try {
            var rows = parsingService.parse(file);
            if (rows != null && !rows.isEmpty()) {
                latestImportSummary = importService.importRows(rows);
            } else {
                latestImportSummary = new ImportSummary(0, 0, List.of("No rows were extracted from the uploaded file."));
            }
        } catch (Exception ex) {
            latestImportSummary = new ImportSummary(0, 0, List.of("Import failed: " + ex.getMessage()));
        }
        return new UploadResponse(saved.getId(), saved.getFileName(), saved.getFileType(), saved.getFileSize(), saved.getUploadedAt());
    }

    public List<DocumentResponse> listDocuments() {
        return documentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<DocumentResponse> getDocument(Long id) {
        return documentRepository.findById(id).map(this::toResponse);
    }

    @Transactional
    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public ImportSummary getLatestImportSummary() {
        return latestImportSummary;
    }

    private DocumentResponse toResponse(DocumentRecord record) {
        return new DocumentResponse(record.getId(), record.getFileName(), record.getFileType(), record.getFileSize(), record.getExtractedText(), record.getUploadedAt());
    }

    private String detectFileType(String originalFileName) {
        String extension = Optional.ofNullable(originalFileName).orElse("")
                .contains(".")
                ? originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase()
                : "";
        return switch (extension) {
            case "txt" -> "text/plain";
            case "json" -> "application/json";
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "csv" -> "text/csv";
            case "xml" -> "application/xml";
            default -> "application/octet-stream";
        };
    }
}

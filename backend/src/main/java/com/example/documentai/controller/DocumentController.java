package com.example.documentai.controller;

import com.example.documentai.dto.DocumentResponse;
import com.example.documentai.dto.UploadResponse;
import com.example.documentai.service.DocumentService;
import com.example.documentai.service.ImportService;
import com.example.documentai.dto.ImportSummary;
import java.util.Map;
import com.example.documentai.parser.ParsingService;
import com.example.documentai.parser.ParsedPreview;
import com.example.documentai.parser.ParsedRow;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final ParsingService parsingService;
    private final ImportService importService;

    public DocumentController(DocumentService documentService, ParsingService parsingService, ImportService importService) {
        this.documentService = documentService;
        this.parsingService = parsingService;
        this.importService = importService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        var uploadResult = documentService.uploadDocument(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", uploadResult.id(),
                "fileName", uploadResult.fileName(),
                "fileType", uploadResult.fileType(),
                "fileSize", uploadResult.fileSize(),
                "uploadedAt", uploadResult.uploadedAt(),
                "importSummary", documentService.getLatestImportSummary()
        ));
    }

    @PostMapping("/preview")
    public ResponseEntity<ParsedPreview> preview(@RequestParam("file") MultipartFile file) {
        List<ParsedRow> rows = parsingService.parse(file);
        String fileName = file.getOriginalFilename();
        String fileType = Optional.ofNullable(fileName).orElse("").contains(".")
                ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
                : "";
        return ResponseEntity.ok(new ParsedPreview(fileName, fileType, rows));
    }

    @PostMapping("/import")
    public ResponseEntity<ImportSummary> importFile(@RequestParam("file") MultipartFile file) {
        List<ParsedRow> rows = parsingService.parse(file);
        ImportSummary summary = importService.importRows(rows);
        return ResponseEntity.ok(summary);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> listDocuments() {
        return ResponseEntity.ok(documentService.listDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return documentService.getDocument(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}

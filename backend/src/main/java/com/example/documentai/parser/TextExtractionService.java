package com.example.documentai.parser;

import com.example.documentai.exception.InvalidFileException;
import com.example.documentai.parser.TextCleaningUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class TextExtractionService {

    private final List<DocumentParser> parsers;

    public TextExtractionService(List<DocumentParser> parsers) {
        this.parsers = parsers;
    }

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty or missing.");
        }

        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("");
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase() : "";
        SupportedFileType type = resolveType(extension);

        return parsers.stream()
                .filter(parser -> parser.supportedType() == type)
                .findFirst()
                .map(parser -> TextCleaningUtils.clean(parser.extractText(file)))
                .orElseThrow(() -> new InvalidFileException("Unsupported file type: " + extension));
    }

    private SupportedFileType resolveType(String extension) {
        return switch (extension) {
            case "txt", "md" -> SupportedFileType.TXT;
            case "json" -> SupportedFileType.JSON;
            case "pdf" -> SupportedFileType.PDF;
            case "docx" -> SupportedFileType.DOCX;
            case "csv" -> SupportedFileType.CSV;
            case "tsv" -> SupportedFileType.TSV;
            case "xlsx", "xls" -> SupportedFileType.XLSX;
            case "xml" -> SupportedFileType.XML;
            default -> throw new InvalidFileException("Unsupported file type: " + extension);
        };
    }
}

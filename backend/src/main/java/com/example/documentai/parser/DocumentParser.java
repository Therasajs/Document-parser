package com.example.documentai.parser;

import org.springframework.web.multipart.MultipartFile;

public interface DocumentParser {
    SupportedFileType supportedType();

    String extractText(MultipartFile file);
}

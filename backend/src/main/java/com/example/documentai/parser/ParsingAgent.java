package com.example.documentai.parser;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ParsingAgent {
    SupportedFileType supportedType();

    List<ParsedRow> parse(MultipartFile file);
}

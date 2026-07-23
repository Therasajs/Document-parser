package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

// @Component - DISABLED: Use TxtParsingAgent instead
public class DefaultParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        // This agent is a fallback; it won't be picked directly by type resolution,
        // but keeping the implementation here in case it's wired differently in tests.
        return SupportedFileType.TXT;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            content = TextCleaningUtils.clean(content);
            return List.of(new ParsedRow(java.util.Map.of("text", content)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse file", ex);
        }
    }
}

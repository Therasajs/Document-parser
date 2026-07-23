package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@Component
public class JsonParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.JSON;
    }

    @Override
    public String extractText(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return TextCleaningUtils.clean(content.replaceAll("\\s+", " "));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read JSON file", ex);
        }
    }
}

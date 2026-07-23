package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@Component
public class XmlParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.XML;
    }

    @Override
    public String extractText(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return TextCleaningUtils.clean(content.replaceAll("<[^>]+>", " "));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read XML file", ex);
        }
    }
}

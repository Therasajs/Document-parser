package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@Component
public class TxtParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.TXT;
    }

    @Override
    public String extractText(MultipartFile file) {
        try {
            return TextCleaningUtils.clean(new String(file.getBytes(), StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read text file", ex);
        }
    }
}

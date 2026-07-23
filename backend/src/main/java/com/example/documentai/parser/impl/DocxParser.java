package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class DocxParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.DOCX;
    }

    @Override
    public String extractText(MultipartFile file) {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return TextCleaningUtils.clean(extractor.getText());
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read DOCX file", ex);
        }
    }
}

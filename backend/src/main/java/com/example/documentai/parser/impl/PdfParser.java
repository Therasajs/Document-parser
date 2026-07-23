package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class PdfParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.PDF;
    }

    @Override
    public String extractText(MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            try (PDDocument document = Loader.loadPDF(content)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return TextCleaningUtils.clean(stripper.getText(document));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read PDF file", ex);
        }
    }
}

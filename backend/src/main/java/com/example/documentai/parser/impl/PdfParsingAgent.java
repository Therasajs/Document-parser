package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Component
public class PdfParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.PDF;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            PDDocument document = Loader.loadPDF(fileBytes);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            // Use TxtParsingAgent to parse the extracted text as structured format
            TxtParsingAgent txtParser = new TxtParsingAgent();
            List<ParsedRow> rows = txtParser.parseStructuredText(text);

            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse PDF file", ex);
        }
    }
}

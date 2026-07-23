package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Component
public class DocxParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.DOCX;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            XWPFDocument document = new XWPFDocument(file.getInputStream());
            StringBuilder textBuilder = new StringBuilder();

            for (XWPFParagraph paragraph : document.getParagraphs()) {
                textBuilder.append(paragraph.getText()).append("\n");
            }

            document.close();

            // Use TxtParsingAgent to parse the extracted text as structured format
            TxtParsingAgent txtParser = new TxtParsingAgent();
            List<ParsedRow> rows = txtParser.parseStructuredText(textBuilder.toString());

            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse DOCX file", ex);
        }
    }
}

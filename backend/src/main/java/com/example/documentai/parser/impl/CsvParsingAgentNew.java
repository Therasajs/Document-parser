package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class CsvParsingAgentNew implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.CSV;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<ParsedRow> rows = new ArrayList<>();

            String[] lines = content.split("\\r?\\n");
            if (lines.length < 2) {
                return rows;
            }

            // Parse header
            String[] headers = parseCsvLine(lines[0]);

            // Parse data rows
            for (int i = 1; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                String[] values = parseCsvLine(line);
                Map<String, String> map = new LinkedHashMap<>();

                for (int j = 0; j < headers.length && j < values.length; j++) {
                    map.put(headers[j].trim(), values[j].trim());
                }

                if (!map.isEmpty()) {
                    rows.add(new ParsedRow(map));
                }
            }

            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse CSV file", ex);
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }

        values.add(current.toString());
        return values.toArray(new String[0]);
    }
}

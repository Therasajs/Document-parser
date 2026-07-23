package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import com.opencsv.CSVReader;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class CsvParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.CSV;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> all = reader.readAll();
            List<ParsedRow> rows = new ArrayList<>();
            if (all.isEmpty()) return rows;

            String[] header = all.get(0);
            int start = 1;

            for (int i = start; i < all.size(); i++) {
                String[] cols = all.get(i);
                Map<String, String> map = new LinkedHashMap<>();
                for (int j = 0; j < cols.length; j++) {
                    String key = j < header.length && header[j] != null && !header[j].isBlank() ? header[j] : "col" + j;
                    map.put(key, cols[j] == null ? "" : cols[j]);
                }
                rows.add(new ParsedRow(map));
            }
            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse CSV file", ex);
        }
    }
}

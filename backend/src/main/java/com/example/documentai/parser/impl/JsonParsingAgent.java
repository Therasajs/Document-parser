package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JsonParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.JSON;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();

            List<ParsedRow> rows = new ArrayList<>();

            // Parse JSON as array
            JsonNode root = mapper.readTree(content);

            if (root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, String> map = new LinkedHashMap<>();

                    // Extract all fields
                    node.fields().forEachRemaining(entry -> {
                        String value = entry.getValue().asText("");
                        map.put(entry.getKey(), value);
                    });

                    if (!map.isEmpty()) {
                        rows.add(new ParsedRow(map));
                    }
                }
            } else if (root.isObject()) {
                // Single object - wrap in list
                Map<String, String> map = new LinkedHashMap<>();
                root.fields().forEachRemaining(entry -> {
                    String value = entry.getValue().asText("");
                    map.put(entry.getKey(), value);
                });
                rows.add(new ParsedRow(map));
            }

            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse JSON file", ex);
        }
    }
}

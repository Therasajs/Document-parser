package com.example.documentai.parser;

import java.util.Collections;
import java.util.Map;

public record ParsedRow(Map<String, String> columns) {
    public ParsedRow {
        columns = columns == null ? Collections.emptyMap() : Collections.unmodifiableMap(columns);
    }
}

package com.example.documentai.parser;

import java.util.List;

public record ParsedResult(String extractedText, List<ParsedRow> rows) {
}

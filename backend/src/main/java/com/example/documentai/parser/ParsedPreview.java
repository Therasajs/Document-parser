package com.example.documentai.parser;

import java.util.List;

public record ParsedPreview(String fileName, String fileType, List<ParsedRow> rows) {
}

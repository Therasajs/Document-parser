package com.example.documentai.parser;

public final class TextCleaningUtils {

    private TextCleaningUtils() {
    }

    public static String clean(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        String cleaned = text.replace("\uFEFF", "");
        cleaned = cleaned.replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]", " ");
        cleaned = cleaned.replaceAll("[ \t\r\n]+", " ");
        return cleaned.trim();
    }
}

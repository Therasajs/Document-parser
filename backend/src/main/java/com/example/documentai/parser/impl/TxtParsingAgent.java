package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class TxtParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.TXT;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<ParsedRow> structuredRows = parseStructuredQuestions(content);
            if (structuredRows.isEmpty()) {
                throw new IllegalStateException("No valid questions found in file");
            }
            return structuredRows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse TXT file", ex);
        }
    }

    public List<ParsedRow> parseStructuredText(String content) {
        return parseStructuredQuestions(content);
    }

    private List<ParsedRow> parseStructuredQuestions(String content) {
        List<ParsedRow> rows = new ArrayList<>();
        String[] lines = content.split("\\r?\\n");

        String curQuestion = null;
        String optA = "";
        String optB = "";
        String optC = "";
        String optD = "";
        String answer = "";

        for (String line : lines) {
            if (line == null) continue;
            line = line.trim();
            if (line.isEmpty()) continue;

            // Question marker - save previous and reset
            if (line.matches("(?i)^Question\\s+\\d+.*")) {
                if (isComplete(curQuestion, optA, optB, optC, optD, answer)) {
                    rows.add(buildRow(curQuestion, optA, optB, optC, optD, answer));
                }
                curQuestion = null;
                optA = "";
                optB = "";
                optC = "";
                optD = "";
                answer = "";
                continue;
            }

            // Skip separators
            if (line.matches("^-{3,}$")) continue;

            // Extract option
            if (line.length() >= 2 && "ABCD".indexOf(line.charAt(0)) >= 0 &&
                (line.charAt(1) == '.' || line.charAt(1) == ':')) {
                String opt = line.substring(2).trim();
                if (!opt.isEmpty()) {
                    switch (line.charAt(0)) {
                        case 'A' -> optA = opt;
                        case 'B' -> optB = opt;
                        case 'C' -> optC = opt;
                        case 'D' -> optD = opt;
                    }
                }
                continue;
            }

            // Extract answer
            if (line.toLowerCase().contains("answer")) {
                for (char c : "ABCD".toCharArray()) {
                    if (line.indexOf(c) >= 0) {
                        answer = String.valueOf(c);
                        break;
                    }
                }
                continue;
            }

            // Question text
            if (curQuestion == null && !line.matches("[A-D][.:].*")) {
                curQuestion = line;
            }
        }

        // Save last question if complete
        if (isComplete(curQuestion, optA, optB, optC, optD, answer)) {
            rows.add(buildRow(curQuestion, optA, optB, optC, optD, answer));
        }

        return rows;
    }

    private boolean isComplete(String q, String a, String b, String c, String d, String ans) {
        return q != null && !a.isEmpty() && !b.isEmpty() && !c.isEmpty() && !d.isEmpty() && !ans.isEmpty();
    }

    private ParsedRow buildRow(String question, String optA, String optB, String optC, String optD, String answer) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("question", question);
        map.put("option_a", optA);
        map.put("option_b", optB);
        map.put("option_c", optC);
        map.put("option_d", optD);
        map.put("answer", answer);
        return new ParsedRow(map);
    }
}

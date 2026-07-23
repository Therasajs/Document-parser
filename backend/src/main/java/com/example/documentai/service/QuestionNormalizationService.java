package com.example.documentai.service;

import org.springframework.stereotype.Service;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
public class QuestionNormalizationService {

    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s+");
    private static final Pattern PUNCTUATION = Pattern.compile("[.,;:!?\"'()\\-–—]");
    private static final Pattern SPECIAL_CHARS = Pattern.compile("[^a-zA-Z0-9\\s]");

    public String normalize(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        String normalized = text
                .trim()
                .toLowerCase()
                .replaceAll("\\r\\n|\\r|\\n", " ")
                .replaceAll("\\t", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("&apos;", "'");

        normalized = removeAccents(normalized);
        normalized = PUNCTUATION.matcher(normalized).replaceAll("");
        normalized = MULTIPLE_SPACES.matcher(normalized).replaceAll(" ");

        return normalized.trim();
    }

    public String normalizeForComparison(String text) {
        return normalize(text);
    }

    public String normalizeForStorage(String text) {
        return normalize(text);
    }

    private String removeAccents(String text) {
        String nfd = Normalizer.normalize(text, Normalizer.Form.NFD);
        return nfd.replaceAll("[^\\p{ASCII}]", "");
    }

    public boolean isSimilar(String text1, String text2) {
        String norm1 = normalize(text1);
        String norm2 = normalize(text2);
        return norm1.equals(norm2);
    }

    public boolean isSimilarWithTolerance(String text1, String text2, double similarityThreshold) {
        String norm1 = normalize(text1);
        String norm2 = normalize(text2);

        if (norm1.equals(norm2)) {
            return true;
        }

        double similarity = calculateSimilarity(norm1, norm2);
        return similarity >= similarityThreshold;
    }

    private double calculateSimilarity(String text1, String text2) {
        int maxLength = Math.max(text1.length(), text2.length());
        if (maxLength == 0) return 1.0;

        int distance = levenshteinDistance(text1, text2);
        return 1.0 - (double) distance / maxLength;
    }

    private int levenshteinDistance(String s1, String s2) {
        if (s1.length() == 0) return s2.length();
        if (s2.length() == 0) return s1.length();

        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[s1.length()][s2.length()];
    }
}

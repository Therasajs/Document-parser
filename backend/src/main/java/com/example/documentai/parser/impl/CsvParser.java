package com.example.documentai.parser.impl;

import com.example.documentai.parser.DocumentParser;
import com.example.documentai.parser.SupportedFileType;
import com.example.documentai.parser.TextCleaningUtils;
import com.opencsv.CSVReader;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class CsvParser implements DocumentParser {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.CSV;
    }

    @Override
    public String extractText(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            return TextCleaningUtils.clean(reader.readAll().stream()
                    .flatMap(Arrays::stream)
                    .collect(Collectors.joining(" ")));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to read CSV file", ex);
        }
    }
}

package com.example.documentai.parser.impl;

import com.example.documentai.parser.ParsedRow;
import com.example.documentai.parser.ParsingAgent;
import com.example.documentai.parser.SupportedFileType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class XmlParsingAgent implements ParsingAgent {

    @Override
    public SupportedFileType supportedType() {
        return SupportedFileType.XML;
    }

    @Override
    public List<ParsedRow> parse(MultipartFile file) {
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<ParsedRow> rows = new ArrayList<>();

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new java.io.ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)));

            // Get all question elements
            NodeList questionNodes = doc.getElementsByTagName("question");

            for (int i = 0; i < questionNodes.getLength(); i++) {
                Element questionElement = (Element) questionNodes.item(i);
                Map<String, String> map = new LinkedHashMap<>();

                // Extract all child elements as key-value pairs
                NodeList children = questionElement.getChildNodes();
                for (int j = 0; j < children.getLength(); j++) {
                    Node node = children.item(j);
                    if (node.getNodeType() == Node.ELEMENT_NODE) {
                        Element element = (Element) node;
                        String tagName = element.getTagName();
                        String textContent = element.getTextContent().trim();

                        // Map common field names
                        if (tagName.equalsIgnoreCase("text")) {
                            map.put("question", textContent);
                        } else if (tagName.equalsIgnoreCase("question")) {
                            map.put("question", textContent);
                        } else {
                            map.put(tagName.toLowerCase(), textContent);
                        }
                    }
                }

                if (!map.isEmpty()) {
                    rows.add(new ParsedRow(map));
                }
            }

            return rows;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to parse XML file", ex);
        }
    }
}

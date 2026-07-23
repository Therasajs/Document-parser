package com.example.documentai.service;

import com.example.documentai.dto.QuestionDTO;
import com.example.documentai.entity.Question;
import com.example.documentai.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Optional<QuestionDTO> getQuestion(Long id) {
        return questionRepository.findById(id).map(this::toDTO);
    }

    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getQuestionsByDomain(String domain) {
        return questionRepository.findByDomain(domain).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getQuestionsByDifficulty(String difficulty) {
        return questionRepository.findByDifficulty(difficulty).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getQuestionCount() {
        return questionRepository.count();
    }

    public long getQuestionCountByDomain(String domain) {
        return questionRepository.findByDomain(domain).size();
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllQuestions() {
        questionRepository.deleteAll();
    }

    private QuestionDTO toDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestion(question.getQuestion());
        dto.setOptionA(question.getOptionA());
        dto.setOptionB(question.getOptionB());
        dto.setOptionC(question.getOptionC());
        dto.setOptionD(question.getOptionD());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setExplanation(question.getExplanation());
        dto.setDifficulty(question.getDifficulty());
        dto.setDomain(question.getDomain());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());
        return dto;
    }
}

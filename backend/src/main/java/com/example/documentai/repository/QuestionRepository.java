package com.example.documentai.repository;

import com.example.documentai.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    boolean existsByQuestion(String question);

    @Query("SELECT q FROM Question q WHERE q.questionNormalized = ?1")
    Optional<Question> findByQuestionNormalized(String normalizedQuestion);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.questionNormalized = ?1")
    long countByQuestionNormalized(String normalizedQuestion);

    @Query("SELECT q FROM Question q WHERE q.domain = ?1")
    List<Question> findByDomain(String domain);

    @Query("SELECT q FROM Question q WHERE q.difficulty = ?1")
    List<Question> findByDifficulty(String difficulty);
}

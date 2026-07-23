package com.example.documentai.repository;

import com.example.documentai.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImportLogRepository extends JpaRepository<ImportLog, Long> {

    @Query("SELECT l FROM ImportLog l WHERE l.documentId = ?1 ORDER BY l.processedAt DESC")
    List<ImportLog> findByDocumentIdOrderByProcessedAtDesc(Long documentId);

    @Query("SELECT l FROM ImportLog l WHERE l.processedAt BETWEEN ?1 AND ?2 ORDER BY l.processedAt DESC")
    List<ImportLog> findByProcessedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT l FROM ImportLog l ORDER BY l.processedAt DESC LIMIT 10")
    List<ImportLog> findLatestImports();

    @Query("SELECT SUM(l.savedRecords) FROM ImportLog l")
    Long getTotalImportedRecords();

    @Query("SELECT COUNT(l) FROM ImportLog l WHERE l.failedRecords > 0")
    long countFailedImports();
}

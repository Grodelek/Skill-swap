package com.tutoring.app.lesson;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
  Lesson getLessonById(UUID id);
  List<Lesson> getLessonByTutorId(UUID tutorId);

  @Query("""
      SELECT l FROM Lesson l
      JOIN FETCH l.tutor tutor
      WHERE (:subject IS NULL OR LOWER(l.subject) = LOWER(:subject))
        AND (:userId IS NULL OR tutor.id <> :userId)
        AND (:minPrice IS NULL OR l.price IS NULL OR l.price >= :minPrice)
        AND (:maxPrice IS NULL OR l.price IS NULL OR l.price <= :maxPrice)
        AND NOT EXISTS (
          SELECT favorite.id FROM FavoriteTutor favorite
          WHERE favorite.student.id = :studentId
            AND favorite.tutor.id = tutor.id
        )
      """)
  List<Lesson> findDiscoveryLessons(
      @Param("studentId") UUID studentId,
      @Param("userId") UUID userId,
      @Param("subject") String subject,
      @Param("minPrice") BigDecimal minPrice,
      @Param("maxPrice") BigDecimal maxPrice);
}

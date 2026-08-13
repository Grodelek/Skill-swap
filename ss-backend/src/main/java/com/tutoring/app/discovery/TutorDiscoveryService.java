package com.tutoring.app.discovery;

import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorDiscoveryService {
  private final LessonRepository lessonRepository;
  private final UserService userService;

  @Transactional(readOnly = true)
  public List<TutorSearchResultDTO> searchTutors(UserPrincipal userDetails, TutorSearchRequestDTO request) {
    User currentUser = userService.findByUsername(userDetails.getUsername());
    List<Lesson> filtered = lessonRepository.findDiscoveryLessons(
        currentUser.getId(),
        request.getUserId(),
        request.getSubject(),
        request.getMinPrice(),
        request.getMaxPrice());

    Map<UUID, Lesson> repPerTutor = filtered.stream().collect(Collectors.toMap(
        l -> l.getTutor().getId(), l -> l,
        (l1, l2) -> { if (l1.getPrice() == null) return l2; if (l2.getPrice() == null) return l1;
                      return l1.getPrice().compareTo(l2.getPrice()) <= 0 ? l1 : l2; }));

    return repPerTutor.values().stream()
        .map(l -> toResultWithScore(l, request))
        .sorted(Comparator.comparingDouble(TutorSearchResultDTO::getRating).reversed())
        .limit(5).collect(Collectors.toList());
  }

  private TutorSearchResultDTO toResultWithScore(Lesson lesson, TutorSearchRequestDTO request) {
    User tutor = lesson.getTutor();
    double score = 0.0;
    if (request.getSubject() != null && lesson.getSubject() != null && lesson.getSubject().equalsIgnoreCase(request.getSubject())) score += 20.0;
    if (lesson.getPrice() != null && request.getMinPrice() != null && request.getMaxPrice() != null) {
      BigDecimal mid = request.getMinPrice().add(request.getMaxPrice()).divide(BigDecimal.valueOf(2));
      score += Math.max(0, 25 - lesson.getPrice().subtract(mid).abs().doubleValue());
    } else if (lesson.getPrice() != null && (request.getMinPrice() != null || request.getMaxPrice() != null)) score += 10.0;
    LessonType preferredStyle = request.getPreferredTeachingStyle();
    LessonType tutorStyle = tutor.getLessonType();
    if (preferredStyle != null && tutorStyle != null) {
      if (tutorStyle == preferredStyle) score += 20.0;
      else if (tutorStyle == LessonType.FLEXIBLE) score += 15.0;
    }
    if (request.getPreferredUserType() != null && tutor.getUserType() == request.getPreferredUserType()) score += 15.0;
    if (request.getPreferredAvailability() != null && tutor.getAvailability() == request.getPreferredAvailability()) score += 15.0;
    double baseRating = Math.min(5.0, 1.0 + (tutor.getPoints() != null ? tutor.getPoints() : 0) / 100.0);
    score += baseRating * 2.0;
    double finalScore = score * (0.8 + Math.random() * 0.4);
    return TutorSearchResultDTO.builder()
        .tutorId(tutor.getId()).tutorUsername(tutor.getUsername()).tutorPhotoPath(tutor.getPhotoPath())
        .tutorDescription(tutor.getDescription()).lessonId(lesson.getId()).subject(lesson.getSubject())
        .lessonDescription(lesson.getDescription()).durationTime(lesson.getDurationTime()).price(lesson.getPrice())
        .rating(finalScore).tutorTeachingStyle(tutor.getLessonType()).tutorUserType(tutor.getUserType())
        .tutorAvailability(tutor.getAvailability()).build();
  }
}

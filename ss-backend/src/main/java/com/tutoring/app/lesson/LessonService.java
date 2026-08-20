package com.tutoring.app.lesson;

import com.tutoring.app.message.MessageRepository;
import com.tutoring.app.user.User;
import com.tutoring.app.user.CurrentUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class LessonService {
  private final LessonRepository lessonRepository;
  private final CurrentUserService currentUserService;
  private final MessageRepository messageRepository;

  public LessonService(LessonRepository lessonRepository, CurrentUserService currentUserService, MessageRepository messageRepository) {
    this.lessonRepository = lessonRepository;
    this.currentUserService = currentUserService;
    this.messageRepository = messageRepository;
  }

  public List<Lesson> getAllLessons() { return lessonRepository.findAll(); }

  public LessonResponseDTO createLesson(LessonRequestDTO dto) {
    User tutor = currentUserService.get();
    Lesson lesson = Lesson.builder()
            .tutor(tutor).subject(dto.getSubject())
            .durationTime(dto.getDurationTime()).price(dto.getPrice())
            .description(dto.getDescription()).build();
    return mapToResponseDTO(lessonRepository.save(lesson));
  }

  public ResponseEntity<Lesson> getLessonById(UUID id) {
    return lessonRepository.findById(id)
            .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  public List<Lesson> getLessonsByTutorId(UUID tutorId) {
    if (tutorId == null) throw new IllegalArgumentException("tutorId cannot be null");
    return lessonRepository.getLessonByTutorId(tutorId);
  }

  public ResponseEntity<LessonResponseDTO> updateLesson(UUID id, LessonRequestDTO dto) {
    User tutor = currentUserService.get();
    Optional<Lesson> lessonOptional = lessonRepository.findById(id);
    if (lessonOptional.isEmpty()) return ResponseEntity.notFound().build();
    Lesson lesson = lessonOptional.get();
    if (!lesson.getTutor().getId().equals(tutor.getId())) return ResponseEntity.status(403).build();
    lesson.setSubject(dto.getSubject()); lesson.setDurationTime(dto.getDurationTime());
    lesson.setPrice(dto.getPrice()); lesson.setDescription(dto.getDescription());
    return ResponseEntity.ok(mapToResponseDTO(lessonRepository.save(lesson)));
  }

  public List<LessonWithTutorResponse> getLessonsWithTutors() {
    return lessonRepository.findAll().stream()
        .map(lesson -> LessonWithTutorResponse.builder()
            .id(lesson.getId()).subject(lesson.getSubject()).description(lesson.getDescription())
            .durationTime(lesson.getDurationTime()).tutorId(lesson.getTutor().getId())
            .tutorEmail(lesson.getTutor().getEmail()).tutorUsername(lesson.getTutor().getUsername())
            .tutorPhotoPath(lesson.getTutor().getPhotoPath()).build())
        .collect(Collectors.toList());
  }

  private LessonResponseDTO mapToResponseDTO(Lesson lesson) {
    LessonResponseDTO dto = new LessonResponseDTO();
    dto.setId(lesson.getId()); dto.setSubject(lesson.getSubject());
    dto.setDurationTime(lesson.getDurationTime()); dto.setPrice(lesson.getPrice());
    dto.setDescription(lesson.getDescription()); dto.setTutorId(lesson.getTutor().getId());
    return dto;
  }

  @jakarta.transaction.Transactional
  public ResponseEntity<Void> deleteLesson(UUID id) {
    User tutor = currentUserService.get();
    Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Lesson not found"));
    if (!lesson.getTutor().getId().equals(tutor.getId()))
      return ResponseEntity.status(403).build();
    messageRepository.detachLesson(id);
    lessonRepository.delete(lesson);
    return ResponseEntity.noContent().build();
  }

}

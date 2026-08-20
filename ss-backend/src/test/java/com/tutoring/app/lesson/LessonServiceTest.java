package com.tutoring.app.lesson;

import com.tutoring.app.user.User;
import com.tutoring.app.user.CurrentUserService;
import com.tutoring.app.message.MessageRepository;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LessonServiceTest {
    @Mock
    LessonRepository lessonRepository;
    @Mock
    CurrentUserService currentUserService;
    @Mock
    MessageRepository messageRepository;

    @InjectMocks
    LessonService lessonService;

    private User user;
    private UUID tutorId;
    private LessonRequestDTO lessonRequestDTO;

    @BeforeEach
    void setUp(){
       tutorId = UUID.randomUUID();

       user = User.builder()
          .id(tutorId)
          .email("abc@example.com")
          .username("abc")
          .password("password")
          .build();

       lessonRequestDTO = LessonRequestDTO.builder()
         .subject("Polish")
         .durationTime(45)
         .price(BigDecimal.valueOf(60.00))
         .description("Polish lesson")
         .build();

        when(currentUserService.get()).thenReturn(user);
    }

    @Test
    public void shouldCreateLesson() {
        Lesson lesson = new Lesson();
        lesson.setTutor(user);
        lesson.setSubject(lessonRequestDTO.getSubject());
        lesson.setDescription(lessonRequestDTO.getDescription());
        lesson.setDurationTime(lessonRequestDTO.getDurationTime());
        lesson.setPrice(lessonRequestDTO.getPrice());
        when(lessonRepository.save(any())).thenReturn(lesson);

        LessonResponseDTO result = lessonService.createLesson(lessonRequestDTO);
        assertAll(
                () ->
                {
                    assertNotNull(result);
                },
                () -> {
                    assertEquals(lessonRequestDTO.getSubject(), result.getSubject());
                    assertEquals(lessonRequestDTO.getDescription(), result.getDescription());
                    assertEquals(lessonRequestDTO.getDurationTime(), result.getDurationTime());
                    assertEquals(lessonRequestDTO.getPrice(), result.getPrice());
                });
    }

    @Test
    public void shouldUpdateLesson(){
        UUID lessonId = UUID.randomUUID();

        Lesson lesson = Lesson.builder()
                .id(lessonId)
                .subject("Math")
                .durationTime(60)
                .price(BigDecimal.valueOf(50.00))
                .description("Algebra lesson")
                .tutor(user)
                .build();

        Lesson updatedLesson = Lesson.builder()
                .id(lessonId)
                .subject(lessonRequestDTO.getSubject())
                .durationTime(lessonRequestDTO.getDurationTime())
                .price(lessonRequestDTO.getPrice())
                .description(lessonRequestDTO.getDescription())
                .tutor(user)
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(updatedLesson);

        ResponseEntity<LessonResponseDTO> response = lessonService.updateLesson(lessonId, lessonRequestDTO);
        assertNotNull(response);

        LessonResponseDTO result = response.getBody();
        assertNotNull(result);
        assertAll(
                () -> {
                   assertNotNull(result.getId());
                   assertNotNull(result.getTutorId());
                },
                () -> {
                    assertEquals(lessonRequestDTO.getSubject(), result.getSubject());
                    assertEquals(lessonRequestDTO.getDescription(), result.getDescription());
                    assertEquals(lessonRequestDTO.getDurationTime(), result.getDurationTime());
                    assertEquals(lessonRequestDTO.getPrice(), result.getPrice());
                }
        );
    }

}

package com.tutoring.app.favorite;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@Tag(name = "Favorites", description = "Add and retrieve favourite tutors")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@PreAuthorize("@accessChecker.isTutorProfileComplete(authentication)")
@CrossOrigin
public class FavoriteTutorController {
  private final FavoriteTutorService favoriteTutorService;

  @PostMapping("/add")
  public ResponseEntity<FavoriteTutorDTO> addFavorite(@RequestBody FavoriteTutorDTO request) {
    return ResponseEntity.ok(favoriteTutorService.addFavorite(request.getTutorId()));
  }

  @DeleteMapping("/remove/{tutorId}")
  public ResponseEntity<Void> removeFavorite(@PathVariable UUID tutorId) {
    favoriteTutorService.removeFavorite(tutorId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me")
  public ResponseEntity<List<FavoriteTutorDTO>> getFavorites() {
    return ResponseEntity.ok(favoriteTutorService.getFavoritesForCurrentUser());
  }
}

package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.AccommodationCategoryDTO;
import com.quantumhotel.services.AccommodationCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/room-categories")
@RequiredArgsConstructor
public class AccommodationCategoryController {

    private final AccommodationCategoryService categoryService;

    @GetMapping
    public List<AccommodationCategoryDTO> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public AccommodationCategoryDTO getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    @GetMapping("/available")
    public List<AccommodationCategoryDTO> getAvailable(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam Integer persons) {
        return categoryService.getAvailableCategories(from, to, persons);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationCategoryDTO create(@RequestBody AccommodationCategoryDTO dto) {
        return categoryService.create(dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationCategoryDTO update(@PathVariable Long id, @RequestBody AccommodationCategoryDTO dto) {
        return categoryService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}
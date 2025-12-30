package com.quantumhotel.controllers;

import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-categories")
public class AccommodationCategoryController {

    private final AccommodationCategoryRepository categoryRepository;

    public AccommodationCategoryController(AccommodationCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<AccommodationCategory> getAll() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public AccommodationCategory getById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kategorija nije pronađena"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationCategory create(@RequestBody AccommodationCategory category) {
        return categoryRepository.save(category);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationCategory update(@PathVariable Long id, @RequestBody AccommodationCategory details) {
        AccommodationCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kategorija nije pronađena"));

        if (details.getName() != null) category.setName(details.getName());
        if (details.getCapacity() != null) category.setCapacity(details.getCapacity());
        if (details.getPrice() != null) category.setPrice(details.getPrice());
        if (details.getTwinBeds() != null) category.setTwinBeds(details.getTwinBeds());
        if (details.getUnitsNumber() != null) category.setUnitsNumber(details.getUnitsNumber());
        if (details.getCheckInTime() != null) category.setCheckInTime(details.getCheckInTime());
        if (details.getCheckOutTime() != null) category.setCheckOutTime(details.getCheckOutTime());

        return categoryRepository.save(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

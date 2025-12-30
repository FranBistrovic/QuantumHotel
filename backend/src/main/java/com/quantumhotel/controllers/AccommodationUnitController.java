package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.AccommodationUnitDTO;
import com.quantumhotel.services.AccommodationUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class AccommodationUnitController {

    private final AccommodationUnitService unitService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public List<AccommodationUnitDTO> getAll() {
        return unitService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationUnitDTO getById(@PathVariable Long id) {
        return unitService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationUnitDTO create(@RequestBody AccommodationUnitDTO dto) {
        return unitService.create(dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AccommodationUnitDTO update(@PathVariable Long id, @RequestBody AccommodationUnitDTO dto) {
        return unitService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        unitService.delete(id);
    }
}
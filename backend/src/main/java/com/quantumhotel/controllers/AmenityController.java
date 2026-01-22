package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.AmenityDTO;
import com.quantumhotel.services.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addons")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public List<AmenityDTO> getAll() {
        return amenityService.getAll();
    }

    @GetMapping("/{id}")
    public AmenityDTO getById(@PathVariable Long id) {
        return amenityService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AmenityDTO create(@RequestBody AmenityDTO dto) {
        return amenityService.create(dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public AmenityDTO update(@PathVariable Long id, @RequestBody AmenityDTO dto) {
        return amenityService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        amenityService.delete(id);
    }
}
package com.quantumhotel.controllers;

import com.quantumhotel.entity.AccommodationUnit;
import com.quantumhotel.repository.AccommodationUnitRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class AccommodationUnitController {

    private final AccommodationUnitRepository unitRepository;

    public AccommodationUnitController(AccommodationUnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public List<AccommodationUnit> getAll() {
        return unitRepository.findAll();
    }

    @GetMapping("/{id}")
    public AccommodationUnit getById(@PathVariable Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Soba nije pronađena."));
    }

    @PostMapping
    public AccommodationUnit create(@RequestBody AccommodationUnit unit) {
        return unitRepository.save(unit);
    }

    @PatchMapping("/{id}")
    public AccommodationUnit update(@PathVariable Long id, @RequestBody AccommodationUnit details) {
        AccommodationUnit unit = unitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Soba nije pronađena."));

        if (details.getRoomNumber() != null) unit.setRoomNumber(details.getRoomNumber());
        if (details.getFloor() != null) unit.setFloor(details.getFloor());
        if (details.getIsCleaned() != null) unit.setIsCleaned(details.getIsCleaned());
        if (details.getUnderMaintenance() != null) unit.setUnderMaintenance(details.getUnderMaintenance());
        if (details.getCategory() != null) unit.setCategory(details.getCategory());

        return unitRepository.save(unit);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        unitRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

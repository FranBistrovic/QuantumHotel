package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AccommodationUnitDTO;
import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.entity.AccommodationUnit;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import com.quantumhotel.repository.AccommodationUnitRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccommodationUnitService {

    private final AccommodationUnitRepository unitRepository;
    private final AccommodationCategoryRepository categoryRepository;

    public List<AccommodationUnitDTO> getAll() {
        return unitRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public AccommodationUnitDTO getById(Long id) {
        return toDto(unitRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Soba nije pronađena")));
    }

    public AccommodationUnitDTO create(AccommodationUnitDTO dto) {
        AccommodationUnit unit = new AccommodationUnit();
        mapToEntity(dto, unit);
        return toDto(unitRepository.save(unit));
    }

    public AccommodationUnitDTO update(Long id, AccommodationUnitDTO dto) {
        AccommodationUnit unit = unitRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Soba nije pronađena"));
        mapToEntity(dto, unit);
        return toDto(unitRepository.save(unit));
    }

    public void delete(Long id) {
        unitRepository.deleteById(id);
    }

    private AccommodationUnitDTO toDto(AccommodationUnit unit) {
        AccommodationUnitDTO dto = new AccommodationUnitDTO();
        dto.setId(unit.getId());
        dto.setRoomNumber(unit.getRoomNumber());
        dto.setFloor(unit.getFloor());
        dto.setIsCleaned(unit.getIsCleaned());
        dto.setUnderMaintenance(unit.getUnderMaintenance());
        dto.setCategoryId(unit.getCategory().getId());
        dto.setCategoryName(unit.getCategory().getName());
        return dto;
    }

    private void mapToEntity(AccommodationUnitDTO dto, AccommodationUnit entity) {
        if (dto.getRoomNumber() != null) entity.setRoomNumber(dto.getRoomNumber());
        if (dto.getFloor() != null) entity.setFloor(dto.getFloor());
        if (dto.getIsCleaned() != null) entity.setIsCleaned(dto.getIsCleaned());
        if (dto.getUnderMaintenance() != null) entity.setUnderMaintenance(dto.getUnderMaintenance());
        if (dto.getCategoryId() != null) {
            AccommodationCategory cat = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Kategorija ne postoji"));
            entity.setCategory(cat);
        }
    }
}
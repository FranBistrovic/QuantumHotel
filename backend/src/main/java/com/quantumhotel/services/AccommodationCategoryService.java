package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AccommodationCategoryDTO;
import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccommodationCategoryService {

    private final AccommodationCategoryRepository categoryRepository;

    public List<AccommodationCategoryDTO> getAll() {
        return categoryRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public AccommodationCategoryDTO getById(Long id) {
        return toDto(categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kategorija nije pronađena")));
    }

    public AccommodationCategoryDTO create(AccommodationCategoryDTO dto) {
        AccommodationCategory entity = new AccommodationCategory();
        mapToEntity(dto, entity);
        return toDto(categoryRepository.save(entity));
    }

    public AccommodationCategoryDTO update(Long id, AccommodationCategoryDTO dto) {
        AccommodationCategory entity = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Kategorija nije pronađena"));
        mapToEntity(dto, entity);
        return toDto(categoryRepository.save(entity));
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private AccommodationCategoryDTO toDto(AccommodationCategory entity) {
        AccommodationCategoryDTO dto = new AccommodationCategoryDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setUnitsNumber(entity.getUnitsNumber());
        dto.setCapacity(entity.getCapacity());
        dto.setTwinBeds(entity.getTwinBeds());
        dto.setPrice(entity.getPrice());
        dto.setCheckInTime(entity.getCheckInTime());
        dto.setCheckOutTime(entity.getCheckOutTime());
        return dto;
    }

    private void mapToEntity(AccommodationCategoryDTO dto, AccommodationCategory entity) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getCapacity() != null) entity.setCapacity(dto.getCapacity());
        if (dto.getPrice() != null) entity.setPrice(dto.getPrice());
        if (dto.getTwinBeds() != null) entity.setTwinBeds(dto.getTwinBeds());
        if (dto.getUnitsNumber() != null) entity.setUnitsNumber(dto.getUnitsNumber());
        if (dto.getCheckInTime() != null) entity.setCheckInTime(dto.getCheckInTime());
        if (dto.getCheckOutTime() != null) entity.setCheckOutTime(dto.getCheckOutTime());
    }
}

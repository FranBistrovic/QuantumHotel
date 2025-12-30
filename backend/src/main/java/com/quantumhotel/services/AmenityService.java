package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AmenityDTO;
import com.quantumhotel.entity.Amenity;
import com.quantumhotel.repository.AmenityRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AmenityService {

    private final AmenityRepository amenityRepository;

    public List<AmenityDTO> getAll() {
        return amenityRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public AmenityDTO getById(Long id) {
        return toDto(amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usluga nije pronađena")));
    }

    public AmenityDTO create(AmenityDTO dto) {
        Amenity amenity = new Amenity();
        mapToEntity(dto, amenity);
        return toDto(amenityRepository.save(amenity));
    }

    public AmenityDTO update(Long id, AmenityDTO dto) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usluga nije pronađena"));
        mapToEntity(dto, amenity);
        return toDto(amenityRepository.save(amenity));
    }

    public void delete(Long id) {
        amenityRepository.deleteById(id);
    }

    private AmenityDTO toDto(Amenity entity) {
        AmenityDTO dto = new AmenityDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    private void mapToEntity(AmenityDTO dto, Amenity entity) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getPrice() != null) entity.setPrice(dto.getPrice());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
    }
}
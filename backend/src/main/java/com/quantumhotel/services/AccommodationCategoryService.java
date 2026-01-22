package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AccommodationCategoryDTO;
import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
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

    public List<AccommodationCategoryDTO> getAvailableCategories(LocalDate from, LocalDate to, Integer persons) {
        // dateFrom < dateTo
        if (to.isBefore(from) || to.isEqual(from)) {
            throw new IllegalArgumentException("Datum odlaska mora biti nakon datuma dolaska.");
        }

        // dateFrom > currentDate
        if (from.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Datum dolaska ne može biti u prošlosti.");
        }

        return categoryRepository.findAvailableCategories(from, to, persons)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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
        dto.setImagePath(entity.getImagePath());
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

    public String uploadImage(Long categoryId, MultipartFile image) throws IOException {

        AccommodationCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (image.isEmpty()) {
            throw new RuntimeException("Empty file");
        }

        if (!image.getContentType().startsWith("image/")) {
            throw new RuntimeException("Invalid file type");
        }

        String uploadDir = "uploads/categories/";
        Files.createDirectories(Paths.get(uploadDir));

        String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + filename);

        Files.write(filePath, image.getBytes());

        String relativePath = "/uploads/categories/" + filename;
        category.setImagePath(relativePath);
        categoryRepository.save(category);

        return relativePath;
    }
}

package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AccommodationUnitDTO;
import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.entity.AccommodationUnit;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import com.quantumhotel.repository.AccommodationUnitRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AccommodationUnitServiceTest {

    @Mock
    private AccommodationUnitRepository unitRepository;
    @Mock
    private AccommodationCategoryRepository categoryRepository;

    @InjectMocks
    private AccommodationUnitService unitService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // 1. Izazivanje pogreške: Kreiranje sobe za kategoriju koja ne postoji

    @Test
    void create_InvalidCategory() {
        AccommodationUnitDTO dto = new AccommodationUnitDTO();
        dto.setCategoryId(999L);

        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> unitService.create(dto));
        verify(unitRepository, never()).save(any());
    }

    // 2. Update statusa čišćenja

    @Test
    void update_Status() {
        Long unitId = 1L;
        AccommodationUnit existingUnit = new AccommodationUnit();
        existingUnit.setId(unitId);
        existingUnit.setIsCleaned(false);

        AccommodationCategory category = new AccommodationCategory();
        category.setId(1L);
        existingUnit.setCategory(category);

        AccommodationUnitDTO updateDto = new AccommodationUnitDTO();
        updateDto.setIsCleaned(true);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(existingUnit));
        when(unitRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AccommodationUnitDTO result = unitService.update(unitId, updateDto);

        assertTrue(result.getIsCleaned());
        verify(unitRepository).save(existingUnit);
    }

}
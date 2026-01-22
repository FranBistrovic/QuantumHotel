package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.AccommodationCategoryDTO;
import com.quantumhotel.entity.AccommodationCategory;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AccommodationCategoryServiceTest {

    @Mock
    private AccommodationCategoryRepository categoryRepository;

    @InjectMocks
    private AccommodationCategoryService categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    //1. Dohvat svih kategorija

    @Test
    void getAllCategories() {
        AccommodationCategory category = new AccommodationCategory();
        category.setId(1L);
        category.setName("Double Room");

        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<AccommodationCategoryDTO> result = categoryService.getAll();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Double Room", result.get(0).getName());
    }

    // 2. Izazivanje pogreške: Dohvat nepostojećeg ID-a

    @Test
    void getById_NotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> categoryService.getById(99L));
    }
}

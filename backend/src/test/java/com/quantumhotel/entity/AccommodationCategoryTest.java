package com.quantumhotel.entity;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class AccommodationCategoryTest {

    @Test
    void testCategoryProperties() {
        AccommodationCategory category = new AccommodationCategory();
        category.setId(1L);
        category.setName("Luxury Suite");
        category.setPrice(new BigDecimal("500.00"));
        category.setCapacity(4);

        assertEquals(1L, category.getId());
        assertEquals("Luxury Suite", category.getName());
        assertEquals(new BigDecimal("500.00"), category.getPrice());
        assertEquals(4, category.getCapacity());
    }
}
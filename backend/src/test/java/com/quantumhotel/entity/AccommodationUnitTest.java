package com.quantumhotel.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccommodationUnitTest {

    @Test
    void testUnitProperties() {
        AccommodationUnit unit = new AccommodationUnit();
        assertTrue(unit.getIsCleaned()); // default true
        assertFalse(unit.getUnderMaintenance()); // default false

        AccommodationCategory category = new AccommodationCategory();
        category.setName("Double Room");

        unit.setRoomNumber(101);
        unit.setCategory(category);

        assertEquals(101, unit.getRoomNumber());
        assertEquals("Double Room", unit.getCategory().getName());
    }
}


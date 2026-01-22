package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class ReservationTest {

    private Reservation reservation;
    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setUsername("testuser");

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setDateFrom(LocalDate.now());
        reservation.setDateTo(LocalDate.now().plusDays(2));
        reservation.setUser(user);
        reservation.setStatus(ReservationStatus.PENDING);
    }

    @Test
    void testReservationProperties() {
        assertNotNull(reservation);
        assertEquals(1L, reservation.getId());
        assertEquals(ReservationStatus.PENDING, reservation.getStatus());
        assertEquals("testuser", reservation.getUser().getUsername());
        assertNotNull(reservation.getCreatedAt());
    }
}
    
package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.ReservationListDTO;
import com.quantumhotel.entity.*;
import com.quantumhotel.repository.*;
import com.quantumhotel.users.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private AccommodationCategoryRepository categoryRepository;

    @Mock
    private AccommodationUnitRepository unitRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private AmenityRepository amenityRepository;

    @InjectMocks
    private ReservationService reservationService;

    @Test
    void shouldReturnUserReservations() {
        // ---- User ----
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);

        when(userRepository.findByUsername("john"))
                .thenReturn(Optional.of(user));

        // ---- Category ----
        AccommodationCategory category = new AccommodationCategory();
        category.setName("Deluxe");

        // ---- Unit ----
        AccommodationUnit unit = new AccommodationUnit();
        unit.setId(10L);

        // ---- Reservation ----
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setCategory(category);
        reservation.setUnit(unit);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setDateFrom(LocalDate.now());
        reservation.setDateTo(LocalDate.now().plusDays(3));

        when(reservationRepository.findByUserId(1L))
                .thenReturn(List.of(reservation));

        // ---- Call ----
        List<ReservationListDTO> result =
                reservationService.findMine("john");

        // ---- Assert ----
        assertEquals(1, result.size());
        assertEquals("Deluxe", result.get(0).getCategoryName());
        assertEquals("PENDING", result.get(0).getStatus()); // string
    }

}

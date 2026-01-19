package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.ReservationListDTO;
import com.quantumhotel.services.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @Test
    @WithMockUser(username = "john")
    void shouldReturnMyReservations() throws Exception {
        ReservationListDTO dto = new ReservationListDTO();
        dto.setCategoryName("Deluxe");
        dto.setStatus("PENDING");

        when(reservationService.findMine("john"))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/reservations/me"))
                .andExpect(status().isOk());
    }
}

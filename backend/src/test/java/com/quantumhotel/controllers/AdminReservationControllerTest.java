package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.ReservationDetailsDTO;
import com.quantumhotel.controllers.dto.ReservationListDTO;
import com.quantumhotel.services.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminReservationController.class)
class AdminReservationControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ReservationService reservationService;
    @Test
    @WithMockUser(roles = {"ADMIN"})
    void shouldReturnAllReservations() throws Exception {
        when(reservationService.adminGetAll()).thenReturn(List.of(new ReservationListDTO()));
        mockMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().isOk());
        verify(reservationService).adminGetAll();
    }
    @Test
    @WithMockUser(roles = {"ADMIN"})
    void shouldReturnReservationById() throws Exception {
        ReservationDetailsDTO dto = new ReservationDetailsDTO();
        when(reservationService.adminGet(1L)).thenReturn(dto);
        mockMvc.perform(get("/api/admin/reservations/1"))
                .andExpect(status().isOk());
        verify(reservationService).adminGet(1L);
    }
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldConfirmReservation() throws Exception {
        mockMvc.perform(post("/api/admin/reservations/1/confirm")
                        .with(csrf()))
                .andExpect(status().isOk());
        verify(reservationService).confirm(1L, "admin");
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldRejectReservation() throws Exception {
        mockMvc.perform(post("/api/admin/reservations/1/reject")
                        .param("reason", "Not available")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(reservationService).reject(1L, "admin", "Not available");
    }

    @Test
    void shouldRejectUnauthenticatedUser() throws Exception {
        mockMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().is3xxRedirection());
    }
}

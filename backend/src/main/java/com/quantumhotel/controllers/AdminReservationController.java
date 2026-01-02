package com.quantumhotel.controllers;



import com.quantumhotel.controllers.dto.ReservationDetailsDTO;
import com.quantumhotel.controllers.dto.ReservationListDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public class AdminReservationController {

    private final com.quantumhotel.services.ReservationService reservationService;

    public AdminReservationController(com.quantumhotel.services.ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<ReservationListDTO> getAll() {
        return reservationService.adminGetAll();
    }

    @GetMapping("/{id}")
    public ReservationDetailsDTO get(@PathVariable Long id) {
        return reservationService.adminGet(id);
    }

    @PostMapping("/{id}/confirm")
    public void confirm(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        reservationService.confirm(id, principal.getUsername());
    }

    @PostMapping("/{id}/reject")
    public void reject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails principal
    ) {
        reservationService.reject(id, principal.getUsername(), reason);
    }
}
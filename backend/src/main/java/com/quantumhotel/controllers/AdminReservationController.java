package com.quantumhotel.controllers;
import com.quantumhotel.controllers.dto.ReservationPatchDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;


import com.quantumhotel.controllers.dto.ReservationDetailsDTO;
import com.quantumhotel.controllers.dto.ReservationListDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
            Authentication authentication
    ) {
        reservationService.confirm(id, extractUsername(authentication));
    }

    @PostMapping("/{id}/reject")
    public void reject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication authentication
    ) {
        reservationService.reject(id, extractUsername(authentication), reason);
    }

    @PatchMapping("/{id}/update")
    public void update(
            @PathVariable Long id,
            @RequestBody ReservationPatchDto dto,
            Authentication authentication
    ) {
        String username = authentication.getName(); // or use your extractUsername() method
        reservationService.patchAdmin(id, dto, username);
    }

    private String extractUsername(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userDetails.getUsername(); // normal login
        }

        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email"); // Google OAuth2
        }

        throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
    }
}
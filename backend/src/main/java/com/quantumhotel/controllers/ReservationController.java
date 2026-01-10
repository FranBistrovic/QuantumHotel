package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.*;
import com.quantumhotel.entity.Reservation;
import com.quantumhotel.services.UserService;
import com.quantumhotel.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import com.quantumhotel.services.ReservationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.nio.file.attribute.UserPrincipal;
import java.util.List;


@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final com.quantumhotel.services.ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }



    @GetMapping("/me")
    public List<ReservationListDTO> myReservations(
            Authentication authentication)
    {
        return reservationService.findMine(extractUsername(authentication));
    }

    @PostMapping
    public ReservationListDTO create(
            @RequestBody ReservationCreateDTO dto,
            Authentication authentication
    ) {
        return ReservationListDTO.from(
                reservationService.create(dto, extractUsername(authentication))
        );
    }
    @PatchMapping("/{id}")
    public ReservationListDTO patch(
            @PathVariable Long id,
            @RequestBody ReservationPatchDto dto,
            Authentication authentication
    ) {
        return ReservationListDTO.from(
                reservationService.patch(id, dto, extractUsername(authentication))
        );
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
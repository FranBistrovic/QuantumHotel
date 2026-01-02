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
            @AuthenticationPrincipal UserDetails principal
    ) {
        return reservationService.findMine(principal.getUsername());
    }

    @PostMapping
    public ReservationListDTO create(
            @RequestBody ReservationCreateDTO dto,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ReservationListDTO.from(
                reservationService.create(dto, principal.getUsername())
        );
    }
    @PatchMapping("/{id}")
    public ReservationListDTO patch(
            @PathVariable Long id,
            @RequestBody ReservationPatchDto dto,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ReservationListDTO.from(
                reservationService.patch(id, dto, principal.getUsername())
        );
    }
}
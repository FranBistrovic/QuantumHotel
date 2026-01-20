package com.quantumhotel.services;


import com.quantumhotel.controllers.dto.ReservationCreateDTO;
import com.quantumhotel.controllers.dto.ReservationDetailsDTO;
import com.quantumhotel.controllers.dto.ReservationListDTO;
import com.quantumhotel.controllers.dto.ReservationPatchDto;
import com.quantumhotel.entity.*;
import com.quantumhotel.repository.*;
import com.quantumhotel.services.EmailService;
import com.quantumhotel.users.User;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AccommodationCategoryRepository categoryRepository;
    private final AccommodationUnitRepository unitRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AmenityRepository amenityRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            AccommodationCategoryRepository categoryRepository,
            AccommodationUnitRepository unitRepository,
            UserRepository userRepository,
            EmailService emailService,
            AmenityRepository amenityRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.categoryRepository = categoryRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.emailService=emailService;
        this.amenityRepository=amenityRepository;
    }

    // ================= USER =================

    public Reservation create(ReservationCreateDTO dto, String username) {
        User user = resolveUser(username);

        Reservation r = new Reservation();
        r.setDateFrom(dto.getDateFrom());
        r.setDateTo(dto.getDateTo());
        r.setUser(user);

        AccommodationUnit unit = findFreeUnit(
                dto.getCategoryId(),
                dto.getDateFrom(),
                dto.getDateTo()
        );

        r.setUnit(unit);
        r.setCategory(categoryRepository.findById(dto.getCategoryId()).orElseThrow());

        r.setStatus(ReservationStatus.PENDING);

        //amenities
        if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
            dto.getAmenities().forEach(aReq -> {
                ReservationAmenity ra = new ReservationAmenity();
                ra.setAmenity(
                        amenityRepository.findById(aReq.getAmenityId())
                                .orElseThrow(() ->
                                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Amenity not found"))
                );
                ra.setQuantity(aReq.getQuantity());
                r.addAmenity(ra); //
            });
        }

        return reservationRepository.save(r);
    }


    @Transactional(readOnly = true)
    public List<ReservationListDTO> findMine(String username) {
        User user = resolveUser(username);

        return reservationRepository.findByUserId(user.getId())
                .stream()
                .map(ReservationListDTO::from)
                .toList();
    }
    public Reservation patch(Long id, ReservationPatchDto dto, String username) {
        User user = resolveUser(username);

        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!r.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        if (r.getStatus() != ReservationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING reservations can be modified"
            );
        }



        if (dto.getDateFrom() != null) r.setDateFrom(dto.getDateFrom());
        if (dto.getDateTo() != null) r.setDateTo(dto.getDateTo());
        if (dto.getAmenities() != null) {
            for (ReservationPatchDto.AmenityRequest req : dto.getAmenities()) {

                Optional<Amenity> amenityOpt = amenityRepository.findById(req.getAmenityId());
                if (amenityOpt.isEmpty()) {
                    continue;
                }
                if (req.getQuantity() == 0) {
                    r.getReservationAmenities().removeIf(
                            ra -> ra.getAmenity().getId().equals(req.getAmenityId())
                    );
                    continue;
                }

                ReservationAmenity ra = r.getReservationAmenities().stream()
                        .filter(a -> a.getAmenity().getId().equals(req.getAmenityId()))
                        .findFirst()
                        .orElseGet(() -> {
                            ReservationAmenity newRa = new ReservationAmenity();
                            newRa.setReservation(r);
                            newRa.setAmenity(amenityOpt.get());
                            r.getReservationAmenities().add(newRa);
                            return newRa;
                        });

                ra.setQuantity(req.getQuantity());
            }
        }
        List<Reservation> conflicts =
                reservationRepository.findConfirmedOverlaps(
                        r.getUnit().getId(),
                        r.getDateFrom(),
                        r.getDateTo()
                );

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit is already booked in selected period"
            );
        }
        return reservationRepository.save(r);
    }


    // ================= ADMIN / STAFF =================

    @Transactional(readOnly = true)
    public ReservationDetailsDTO adminGet(Long id) {
        return ReservationDetailsDTO.from(
                reservationRepository.findById(id).orElseThrow()
        );
    }
    public List<ReservationListDTO> adminGetAll() {
        return reservationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ReservationListDTO::from)
                .toList();
    }

    public void confirm(Long id, String username) {
        User admin = resolveUser(username);
        Reservation r = getReservation(id);

        List<Reservation> conflicts =
                reservationRepository.findConfirmedOverlaps(
                        r.getUnit().getId(),
                        r.getDateFrom(),
                        r.getDateTo()
                );

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit is already booked in selected period"
            );
        }
        r.setStatus(ReservationStatus.CONFIRMED);
        r.setProcessedAt(Instant.now());
        r.setProcessedBy(admin);

        emailService.sendReservationConfirmed(
                r.getUser().getEmail(),
                r.getId()
        );
    }

    public Reservation patchAdmin(Long id, ReservationPatchDto dto, String username) {
        User admin = resolveUser(username);

        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));


        if (r.getStatus() != ReservationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PENDING reservations can be modified"
            );
        }



        // Update dates if provided
        if (dto.getDateFrom() != null) r.setDateFrom(dto.getDateFrom());
        if (dto.getDateTo() != null) r.setDateTo(dto.getDateTo());
        r.setProcessedAt(Instant.now());
        r.setProcessedBy(admin);


        List<Reservation> conflicts =
                reservationRepository.findConfirmedOverlaps(
                        r.getUnit().getId(),
                        r.getDateFrom(),
                        r.getDateTo()
                );

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit is already booked in selected period"
            );
        }
        // Notify the user about the update
        emailService.sendReservationUpdated(
                r.getUser().getEmail(),
                r.getId(),
                r.getDateFrom(),
                r.getDateTo()
        );
        return reservationRepository.save(r);
    }


    public void reject(Long id, String username, String reason) {
        User admin = resolveUser(username);
        Reservation r = getReservation(id);

        r.setStatus(ReservationStatus.REJECTED);
        r.setProcessedAt(Instant.now());
        r.setProcessedBy(admin);

        emailService.sendReservationRejected(
                r.getUser().getEmail(),
                r.getId(),
                reason
        );
    }

    // ================= INTERNAL =================

    private AccommodationUnit findFreeUnit(
            Long categoryId,
            LocalDate from,
            LocalDate to
    ) {
        List<AccommodationUnit> units =
                unitRepository.findByCategoryId(categoryId);

        for (AccommodationUnit unit : units) {
            boolean hasConflict =
                    !reservationRepository
                            .findConfirmedOverlaps(unit.getId(), from, to)
                            .isEmpty();

            if (!hasConflict) {
                return unit;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "No available units for selected category and period"
        );
    }

    private Reservation getReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private User resolveUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND)
                );
    }
}
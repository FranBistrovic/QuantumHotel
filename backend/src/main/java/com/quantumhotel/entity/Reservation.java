package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Getter
@Setter
public class Reservation{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "res_id")
    private Long id;
    @Column(name = "res_date_from", nullable = false)
    private LocalDate dateFrom;

    @Column(name = "res_date_to", nullable = false)
    private LocalDate dateTo;

    @Column(name = "res_created", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "res_processed")
    private Instant processedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "res_status", nullable = false, length = 16)
    private ReservationStatus status = ReservationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usr_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cat_id", nullable = false)
    private AccommodationCategory category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "un_id", nullable = false)
    private AccommodationUnit unit;

    //amenities
    @OneToMany(
            mappedBy = "reservation",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<ReservationAmenity> reservationAmenities = new ArrayList<>();

    public void addAmenity(ReservationAmenity ra) {
        reservationAmenities.add(ra);
        ra.setReservation(this);
    }
}

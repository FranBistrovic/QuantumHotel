package com.quantumhotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "reservation_amenities")
@Getter
@Setter
public class ReservationAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "res_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "amn_id")
    private Amenity amenity;

    private int quantity;
    // Optionally: usage count, price, etc.
}
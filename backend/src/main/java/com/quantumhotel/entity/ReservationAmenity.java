package com.quantumhotel.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reservation_amenities")
public class ReservationAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Reservation reservation;

    @ManyToOne
    private Amenity amenity;

    private int quantity;
    // Optionally: usage count, price, etc.
}
package com.quantumhotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "AccommodationUnit")
@Getter
@Setter
@NoArgsConstructor
public class AccommodationUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unt_id")
    private Long id;

    @Column(name = "unt_number", nullable = false)
    private Integer roomNumber;

    @Column(name = "unt_floor")
    private Integer floor;

    @Column(name = "unt_cleaned")
    private Boolean isCleaned = true;

    @Column(name = "unt_maintenance")
    private Boolean underMaintenance = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cat_id", nullable = false)
    private AccommodationCategory category;
}

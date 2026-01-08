package com.quantumhotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "Amenities")
@Getter @Setter @NoArgsConstructor
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amn_id")
    private Long id;

    @Column(name = "amn_name", length = 100, nullable = false)
    private String name;

    @Column(name = "amn_price", precision = 10, scale = 5)
    private BigDecimal price;

    @Column(name = "amn_description", columnDefinition = "TEXT")
    private String description;
}

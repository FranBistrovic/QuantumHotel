package com.quantumhotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "AccommodationCategory")
@Getter
@Setter
@NoArgsConstructor
public class AccommodationCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cat_id")
    private Long id;

    @Column(name = "cat_name", length = 100)
    private String name;

    @Column(name = "cat_units_number")
    private Integer unitsNumber;

    @Column(name = "cat_people_num")
    private Integer capacity;

    @Column(name = "cat_twin_beds")
    private Boolean twinBeds;

    @Column(name = "cat_price", precision = 10, scale = 5)
    private BigDecimal price;

    @Column(name = "cat_check_in")
    private LocalTime checkInTime;

    @Column(name = "cat_check_out")
    private LocalTime checkOutTime;
}
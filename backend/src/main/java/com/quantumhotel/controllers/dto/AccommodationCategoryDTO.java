package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalTime;

@Getter @Setter
public class AccommodationCategoryDTO {
    private Long id;
    private String name;
    private Integer unitsNumber;
    private Integer capacity;
    private Boolean twinBeds;
    private BigDecimal price;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}

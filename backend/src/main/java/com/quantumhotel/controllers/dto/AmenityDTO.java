package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class AmenityDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
}
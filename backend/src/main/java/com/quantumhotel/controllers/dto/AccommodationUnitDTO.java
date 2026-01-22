package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AccommodationUnitDTO {
    private Long id;
    private Integer roomNumber;
    private Integer floor;
    private Boolean isCleaned;
    private Boolean underMaintenance;
    private Long categoryId; // Šaljemo samo ID kategorije radi jednostavnosti
    private String categoryName; // Vraćamo ime klijentu da zna o kojoj se sobi radi
}
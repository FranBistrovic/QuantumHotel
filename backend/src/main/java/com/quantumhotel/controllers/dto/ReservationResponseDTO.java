package com.quantumhotel.controllers.dto;


import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationResponseDTO {
    Long id;
    LocalDate dateFrom;
    LocalDate dateTo;
    String status;
    String categoryName;
    Integer unitNumber;
}
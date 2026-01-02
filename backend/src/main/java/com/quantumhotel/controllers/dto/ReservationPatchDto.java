package com.quantumhotel.controllers.dto;



import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter@Setter
public class ReservationPatchDto {

    private LocalDate dateFrom;
    private LocalDate dateTo;
    }
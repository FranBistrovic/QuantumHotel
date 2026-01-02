package com.quantumhotel.controllers.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Data
@Setter
@Getter
public class ReservationCreateDTO {
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private Long categoryId;
    private Long unitId;
}
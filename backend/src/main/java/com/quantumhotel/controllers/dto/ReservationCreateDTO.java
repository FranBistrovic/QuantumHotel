package com.quantumhotel.controllers.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;
import java.util.List;

@Data
@Setter
@Getter
public class ReservationCreateDTO {
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private Long categoryId;
    //amenities
    private List<AmenityRequest> amenities;

    @Data
    public static class AmenityRequest {
        private Long amenityId;
        private int quantity;
    }
}
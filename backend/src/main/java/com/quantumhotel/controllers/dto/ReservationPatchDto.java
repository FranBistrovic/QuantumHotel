package com.quantumhotel.controllers.dto;



import com.quantumhotel.entity.ReservationAmenity;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter@Setter
public class ReservationPatchDto {

    private LocalDate dateFrom;
    private LocalDate dateTo;

    //amenities
    private List<AmenityRequest> amenities;

    @Data
    public static class AmenityRequest {
        private Long amenityId;
        private int quantity;
    }
}
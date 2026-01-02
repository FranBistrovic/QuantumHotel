package com.quantumhotel.controllers.dto;

import com.quantumhotel.entity.Reservation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class ReservationListDTO {
    private Long id;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String status;
    private String categoryName;
    private Integer unitNumber;

    public static ReservationListDTO from(Reservation r) {
        ReservationListDTO dto = new ReservationListDTO();
        dto.setId(r.getId());
        dto.setDateFrom(r.getDateFrom());
        dto.setDateTo(r.getDateTo());
        dto.setStatus(r.getStatus().name());
        dto.setCategoryName(r.getCategory().getName());
        dto.setUnitNumber(r.getUnit().getRoomNumber());
        return dto;
    }


}

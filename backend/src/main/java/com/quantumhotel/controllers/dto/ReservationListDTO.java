package com.quantumhotel.controllers.dto;

import com.quantumhotel.entity.Reservation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Setter
@Getter
public class ReservationListDTO {
    private Long id;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String status;
    private String categoryName;
    private Integer unitNumber;
    private List<AmenityItem> amenities;

    @Getter
    @Setter
    public static class AmenityItem {
        private String name;
        private int quantity;
    }

    public static ReservationListDTO from(Reservation r) {
        ReservationListDTO dto = new ReservationListDTO();
        dto.setId(r.getId());
        dto.setDateFrom(r.getDateFrom());
        dto.setDateTo(r.getDateTo());
        dto.setStatus(r.getStatus().name());
        dto.setCategoryName(r.getCategory().getName());
        dto.setUnitNumber(r.getUnit().getRoomNumber());

        if (r.getReservationAmenities() != null) {
            dto.setAmenities(
                    r.getReservationAmenities().stream().map(ra -> {
                        AmenityItem a = new AmenityItem();
                        a.setName(ra.getAmenity().getName());
                        a.setQuantity(ra.getQuantity());
                        return a;
                    }).collect(Collectors.toList())
            );
        }

        return dto;
    }


}

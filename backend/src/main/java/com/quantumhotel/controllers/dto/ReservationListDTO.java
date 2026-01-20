package com.quantumhotel.controllers.dto;

import com.quantumhotel.entity.Reservation;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Setter
@Getter
public class ReservationListDTO {
    private Long id;
    private Long userId;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String status;
    private String categoryName;
    private Long categoryId;
    private BigDecimal categoryPrice;
    private Integer unitNumber;
    private List<AmenityItem> amenities;

    @Getter
    @Setter
    public static class AmenityItem {
        private Long id;
        private Long amn_id;
        private String name;
        private int quantity;
        private BigDecimal price;
    }

    public static ReservationListDTO from(Reservation r) {
        ReservationListDTO dto = new ReservationListDTO();
        dto.setId(r.getId());
        dto.setUserId(r.getUser().getId());
        dto.setDateFrom(r.getDateFrom());
        dto.setDateTo(r.getDateTo());
        dto.setStatus(r.getStatus().name());
        dto.setCategoryName(r.getCategory().getName());
        dto.setCategoryId(r.getCategory().getId());
        dto.setCategoryPrice(r.getCategory().getPrice());
        dto.setUnitNumber(r.getUnit().getRoomNumber());

        if (r.getReservationAmenities() != null) {
            dto.setAmenities(
                    r.getReservationAmenities().stream().map(ra -> {
                        AmenityItem a = new AmenityItem();
                        a.setId(ra.getId());
                        a.setAmn_id(ra.getAmenity().getId());
                        a.setName(ra.getAmenity().getName());
                        a.setQuantity(ra.getQuantity());
                        a.setPrice(ra.getAmenity().getPrice());
                        return a;
                    }).collect(Collectors.toList())
            );
        }

        return dto;
    }


}

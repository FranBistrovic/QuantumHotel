package com.quantumhotel.controllers.dto;

import com.quantumhotel.entity.Reservation;
import com.quantumhotel.users.dto.UserDto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
public class ReservationDetailsDTO {
    private Long id;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String status;
    private Instant createdAt;
    private Instant processedAt;
    private UserDto user;
    private UserDto processedBy;
    private String categoryName;
    private BigDecimal categoryPrice;
    private Integer unitNumber;

    public static ReservationDetailsDTO from(Reservation r) {
        ReservationDetailsDTO dto = new ReservationDetailsDTO();
        dto.setId(r.getId());
        dto.setDateFrom(r.getDateFrom());
        dto.setDateTo(r.getDateTo());
        dto.setStatus(r.getStatus().name());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setProcessedAt(r.getProcessedAt());
        dto.setUser(UserDto.from(r.getUser()));
        dto.setProcessedBy(
                r.getProcessedBy() != null ? UserDto.from(r.getProcessedBy()) : null
        );
        dto.setCategoryName(r.getCategory().getName());
        dto.setCategoryPrice(r.getCategory().getPrice());
        dto.setUnitNumber(r.getUnit().getRoomNumber());
        return dto;
    }
}

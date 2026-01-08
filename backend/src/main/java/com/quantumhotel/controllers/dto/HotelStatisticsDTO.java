package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class HotelStatisticsDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalReservations;
    private int completedReservations;
    private int cancelledReservations;
    private BigDecimal totalRevenue;
    private BigDecimal averageStayDuration;
    private Map<String, Integer> reservationsByCity;
    private Map<String, Integer> reservationsByGender;
    private Map<String, Integer> reservationsByAgeGroup;
    private List<AccommodationStats> topAccommodations;
    private List<AmenityStats> popularAmenities;

    // Constructors
    public HotelStatisticsDTO() {}

    public HotelStatisticsDTO(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
     }
    public static class AccommodationStats {
        private String categoryName;
        private int reservationCount;
        private BigDecimal totalRevenue;

        public AccommodationStats(String categoryName, int reservationCount, BigDecimal totalRevenue) {
            this.categoryName = categoryName;
            this.reservationCount = reservationCount;
            this.totalRevenue = totalRevenue;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public int getReservationCount() {
            return reservationCount;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }
    }

    public static class AmenityStats {
        private String amenityName;
        private int usageCount;
        private BigDecimal totalRevenue;

        public AmenityStats(String amenityName, int usageCount, BigDecimal totalRevenue) {
            this.amenityName = amenityName;
            this.usageCount = usageCount;
            this.totalRevenue = totalRevenue;
        }

        public String getAmenityName() {
            return amenityName;
        }

        public int getUsageCount() {
            return usageCount;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }
    }
}

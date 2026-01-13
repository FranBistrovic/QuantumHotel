package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.HotelStatisticsDTO;
import com.quantumhotel.repository.AccommodationCategoryRepository;
import com.quantumhotel.repository.AmenityRepository;
import com.quantumhotel.repository.ReservationRepository;
import com.quantumhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccommodationCategoryRepository accommodationCategoryRepository;

    @Autowired
    private AmenityRepository amenityRepository;

    public HotelStatisticsDTO generateStatistics(LocalDate startDate, LocalDate endDate) {
        HotelStatisticsDTO stats = new HotelStatisticsDTO(startDate, endDate);

        // Get all reservations in the date range
        List<Object[]> reservations = reservationRepository.findReservationsInDateRange(startDate, endDate);

        // Calculate basic statistics
        stats.setTotalReservations(reservations.size());

        long completedCount = reservations.stream()
                .filter(r -> "CONFIRMED".equals(r[5].toString())) // res_status
                .count();
        System.out.println(completedCount);
        stats.setCompletedReservations((int) completedCount);

        long cancelledCount = reservations.stream()
                .filter(r -> "REJECTED".equals(r[5].toString()))
                .count();
        stats.setCancelledReservations((int) cancelledCount);

        // Calculate revenue
        BigDecimal totalRevenue = calculateTotalRevenue(reservations);
        stats.setTotalRevenue(totalRevenue);

        // Calculate average stay duration
        BigDecimal avgDuration = calculateAverageStayDuration(reservations);
        stats.setAverageStayDuration(avgDuration);

        // Demographics - by city
        Map<String, Integer> byCity = groupReservationsByCity(reservations);
        stats.setReservationsByCity(byCity);

        // Demographics - by gender
        Map<String, Integer> byGender = groupReservationsByGender(reservations);
        stats.setReservationsByGender(byGender);

        // Demographics - by age group
        Map<String, Integer> byAge = groupReservationsByAgeGroup(reservations);
        stats.setReservationsByAgeGroup(byAge);

        // Top accommodations
        List<HotelStatisticsDTO.AccommodationStats> topAccommodations = getTopAccommodations(startDate, endDate);
        stats.setTopAccommodations(topAccommodations);

        // Popular amenities
        List<HotelStatisticsDTO.AmenityStats> popularAmenities = getPopularAmenities(startDate, endDate);
        stats.setPopularAmenities(popularAmenities);

        return stats;
    }

        private BigDecimal calculateTotalRevenue(List<Object[]> reservations) {
        return reservations.stream()
                .filter(r -> "CONFIRMED".equals(r[5].toString()))
                .map(r -> (BigDecimal) r[8]) // Assuming price is at index 7
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageStayDuration(List<Object[]> reservations) {
        if (reservations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        long totalDays = reservations.stream()
                .mapToLong(r -> {
                    LocalDate from = (LocalDate) r[1]; // res_date_from
                    LocalDate to = (LocalDate) r[2]; // res_date_to
                    return Period.between(from, to).getDays();
                })
                .sum();

        return BigDecimal.valueOf(totalDays)
                .divide(BigDecimal.valueOf(reservations.size()), 2, RoundingMode.HALF_UP);
    }

    private Map<String, Integer> groupReservationsByCity(List<Object[]> reservations) {
        return reservations.stream()
                .map(r -> (String) r[6]) // usr_city
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        city -> city,
                        Collectors.summingInt(e -> 1)
                ));
    }

    private Map<String, Integer> groupReservationsByGender(List<Object[]> reservations) {
        return reservations.stream()
                .map(r -> r[7] != null ? r[7].toString() : "UNKNOWN") // usr_gender
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        gender -> gender,
                        Collectors.summingInt(e -> 1)
                ));
    }

    private Map<String, Integer> groupReservationsByAgeGroup(List<Object[]> reservations) {
        Map<String, Integer> ageGroups = new HashMap<>();

        for (Object[] r : reservations) {
            LocalDate birthDate = (LocalDate) r[9]; // usr_date_of_birth
            if (birthDate != null) {
                int age = Period.between(birthDate, LocalDate.now()).getYears();
                String ageGroup = getAgeGroup(age);
                ageGroups.merge(ageGroup, 1, Integer::sum);
            }
        }

        return ageGroups;
    }

    private String getAgeGroup(int age) {
        if (age < 18) return "Under 18";
        if (age < 25) return "18-24";
        if (age < 35) return "25-34";
        if (age < 45) return "35-44";
        if (age < 55) return "45-54";
        if (age < 65) return "55-64";
        return "65+";
    }

    private List<HotelStatisticsDTO.AccommodationStats> getTopAccommodations(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = accommodationCategoryRepository.findTopAccommodations(startDate, endDate);

        return results.stream()
                .map(r -> new HotelStatisticsDTO.AccommodationStats(
                        (String) r[0], // category name
                        ((Number) r[1]).intValue(), // reservation count
                        (BigDecimal) r[2] // total revenue
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<HotelStatisticsDTO.AmenityStats> getPopularAmenities(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = amenityRepository.findPopularAmenities(startDate, endDate);

        return results.stream()
                .map(r -> new HotelStatisticsDTO.AmenityStats(
                        (String) r[0], // amenity name
                        ((Number) r[1]).intValue(), // usage count
                        (BigDecimal) r[2] // total revenue
                ))
                .limit(10)
                .collect(Collectors.toList());
    }
}
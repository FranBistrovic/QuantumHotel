package com.quantumhotel.repository;

import com.quantumhotel.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    @Query("SELECT a.name, SUM(ra.quantity), SUM(ra.quantity * a.price) " +
            "FROM ReservationAmenity ra " +
            "JOIN ra.amenity a " +
            "JOIN ra.reservation r " +
            "WHERE r.dateFrom >= :startDate AND r.dateTo <= :endDate " +
            "AND r.status = 'CONFIRMED' " +
            "GROUP BY a.Id, a.name " +
            "ORDER BY SUM(ra.quantity) DESC")
    List<Object[]> findPopularAmenities(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
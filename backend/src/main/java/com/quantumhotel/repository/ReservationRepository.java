package com.quantumhotel.repository;

import com.quantumhotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    @Query("""
       SELECT r.id, r.dateFrom, r.dateTo, r.createdAt, r.processedAt,
              r.status, u.city, u.gender,
              c.price
       FROM Reservation r
       JOIN r.user u
       JOIN r.category c
       WHERE r.dateFrom >= :startDate AND r.dateTo <= :endDate
       """)
    List<Object[]> findReservationsInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
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
               r.status, u.city, u.gender, c.price, u.dateOfBirth
        FROM Reservation r
        JOIN r.user u
        JOIN r.category c
        WHERE r.dateFrom >= :startDate AND r.dateTo <= :endDate
        """)
    List<Object[]> findReservationsInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    //preklapanja
    @Query("""
    SELECT r FROM Reservation r
    WHERE r.unit.id = :unitId
      AND (r.status = 'CONFIRMED')
      AND NOT (r.dateTo <= :from OR r.dateFrom >= :to)
""")
    List<Reservation> findConfirmedOverlaps(
            @Param("unitId") Long unitId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
    SELECT r FROM Reservation r
    WHERE r.unit.id = :unitId
      AND (r.status = 'CONFIRMED' OR r.status='PENDING')
      AND r.id <> :reservationId
      AND NOT (r.dateTo <= :from OR r.dateFrom >= :to)
""")
    List<Reservation> findConfirmedOverlapsExcludingSelf(
            @Param("unitId") Long unitId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("reservationId") Long reservationId
    );

}
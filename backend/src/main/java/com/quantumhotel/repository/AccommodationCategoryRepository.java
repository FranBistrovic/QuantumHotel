package com.quantumhotel.repository;

import com.quantumhotel.entity.AccommodationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccommodationCategoryRepository extends JpaRepository<AccommodationCategory, Long> {
    @Query("""
       SELECT c.name, COUNT(r), SUM(c.price)
       FROM Reservation r
       JOIN r.category c
       WHERE r.dateFrom >= :startDate
         AND r.dateTo <= :endDate
         AND r.status = 'COMPLETED'
       GROUP BY c.Id, c.name
       ORDER BY COUNT(r) DESC
       """)
    List<Object[]> findTopAccommodations(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    @Query("""
    SELECT DISTINCT c FROM AccommodationCategory c
    JOIN AccommodationUnit u ON u.category.id = c.id
    WHERE c.capacity = :persons
    AND NOT EXISTS (
        SELECT r FROM Reservation r
        WHERE r.unit.id = u.id
        AND r.status = 'CONFIRMED'
        AND NOT (r.dateTo <= :from OR r.dateFrom >= :to)
    )
""")
    List<AccommodationCategory> findAvailableCategories(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("persons") Integer persons
    );
}

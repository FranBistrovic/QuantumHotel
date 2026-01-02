package com.quantumhotel.repository;

import com.quantumhotel.entity.AccommodationUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccommodationUnitRepository extends JpaRepository<AccommodationUnit, Long> {
    List<AccommodationUnit> findByCategoryId(Long categoryId);
}

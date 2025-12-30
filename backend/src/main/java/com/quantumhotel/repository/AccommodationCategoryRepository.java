package com.quantumhotel.repository;

import com.quantumhotel.entity.AccommodationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccommodationCategoryRepository extends JpaRepository<AccommodationCategory, Long> {
}

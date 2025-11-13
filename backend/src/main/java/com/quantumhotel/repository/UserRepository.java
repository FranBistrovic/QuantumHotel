package com.quantumhotel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.quantumhotel.users.User;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderId(String providerId);
    Optional<User> findByUsername(String username);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByVerificationToken(String verificationToken);
}

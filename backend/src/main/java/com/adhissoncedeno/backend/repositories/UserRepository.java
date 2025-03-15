package com.adhissoncedeno.backend.repositories;

import com.adhissoncedeno.backend.model.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}

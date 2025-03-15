package com.adhissoncedeno.backend.repositories;

import com.adhissoncedeno.backend.model.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
    List<Post> findByIsPublicTrue();
}

package com.adhissoncedeno.backend.services;


import com.adhissoncedeno.backend.model.entities.Post;
import com.adhissoncedeno.backend.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public List<Post> findAll() {
        return postRepository.findAll();
    }

    public List<Post> findPublicPosts() {
        return postRepository.findByIsPublicTrue();
    }

    public List<Post> findByUserId(Long userId) {
        return postRepository.findByUserId(userId);
    }

    public Post findById(Long id) {
        return postRepository.findById(id).orElse(null);
    }

    public Post save(Post post) {
        return postRepository.save(post);
    }

    public void deleteById(Long id) {
        postRepository.deleteById(id);
    }

}

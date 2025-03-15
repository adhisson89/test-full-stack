package com.adhissoncedeno.backend.services;


import com.adhissoncedeno.backend.mappers.PostMapper;
import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.model.entities.Post;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private PostMapper postMapper;

    public List<PostResponseDTO> findAll() {
        return postRepository.findAll().stream()
                .map(postMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<PostResponseDTO> findPublicPosts() {
        return postRepository.findByIsPublicTrue().stream()
                .map(postMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<PostResponseDTO> findByUserId(Long userId) {
        return postRepository.findByUserId(userId).stream()
                .map(postMapper::toDto)
                .collect(Collectors.toList());
    }

    public PostResponseDTO findById(Long id) {
        return postRepository.findById(id)
                .map(postMapper::toDto)
                .orElse(null);
    }

    public PostResponseDTO save(PostRequestDTO postRequestDTO) {
        Post post = postMapper.toEntity(postRequestDTO);

        if (postRequestDTO.getUserId() != null) {
            User user = userService.findById(postRequestDTO.getUserId());
            if (user != null) {
                post.setUser(user);
            }
        }

        return postMapper.toDto(postRepository.save(post));
    }

    public void deleteById(Long id) {
        postRepository.deleteById(id);
    }

}

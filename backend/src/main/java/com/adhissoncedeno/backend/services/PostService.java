package com.adhissoncedeno.backend.services;


import com.adhissoncedeno.backend.mappers.PostMapper;
import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.model.entities.Post;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.repositories.PostRepository;
import com.adhissoncedeno.backend.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isOwner = post.getUser().getId().equals(getUserIdFromAuthentication(authentication));

        if (isAdmin || isOwner) {
            postRepository.deleteById(id);
        } else {
            throw new AccessDeniedException("You don't have permission to delete this post");
        }
    }


    public PostResponseDTO update(PostRequestDTO postRequestDTO) {
        Post post = postRepository.findById(postRequestDTO.getId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isOwner = post.getUser().getId().equals(getUserIdFromAuthentication(authentication));

        if (isAdmin || isOwner) {
            post.setTitle(postRequestDTO.getTitle());
            post.setContent(postRequestDTO.getContent());
            post.setPublic(postRequestDTO.isPublic());
            return postMapper.toDto(postRepository.save(post));
        } else {
            throw new AccessDeniedException("You don't have permission to update this post");
        }
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getId();
        }
        return Long.parseLong(authentication.getName());
    }



}

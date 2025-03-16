package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.security.CustomUserDetails;
import com.adhissoncedeno.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class PostController {

    @Autowired
    private PostService postService;

    @QueryMapping(name = "myPosts")
    @PreAuthorize("isAuthenticated()")
    public List<PostResponseDTO> getMyPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = ((CustomUserDetails) userDetails).getId();
        return postService.findByUserId(userId);
    }

    @QueryMapping(name = "findAllPosts")
    public List<PostResponseDTO> findAll() {
        return postService.findAll();
    }

    @PreAuthorize("hasRole('USER')")
    @MutationMapping(name = "createPost")
    public PostResponseDTO createPost(@Argument PostRequestDTO postRequest) {
        return postService.save(postRequest);
    }

    @MutationMapping(name = "deletePostById")
    public String deletePost(@Argument(name = "id") Long id) {
        postService.deleteById(id);
        return "Post deleted";
    }

    @MutationMapping(name = "updatePostById")
    public PostResponseDTO updatePost(@Argument PostRequestDTO postRequest) {
        return postService.update(postRequest);
    }

    //findPublicPosts
    @QueryMapping(name = "findPublicPosts")
    public List<PostResponseDTO> findPublicPosts() {
        return postService.findPublicPosts();
    }

}

package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class PostController {

    @Autowired
    private PostService postService;

    @QueryMapping(name = "findAllPostsByUserId")
    public List<PostResponseDTO> findAllPostsByUserId(@Argument("id") Long userId) {
        return postService.findByUserId(userId);
    }

    @QueryMapping(name = "findAllPosts")
    public List<PostResponseDTO> findAll() {
        return postService.findAll();
    }

    @MutationMapping(name = "createPost")
    public PostResponseDTO createPost(@Argument PostRequestDTO postRequest) {
        return postService.save(postRequest);
    }

    @MutationMapping(name = "deletePostById")
    public String deletePost(@Argument(name = "id") Long id) {
        postService.deleteById(id);
        return "Post deleted";
    }
}

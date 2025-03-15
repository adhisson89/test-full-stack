package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.graphql.InputPost;
import com.adhissoncedeno.backend.model.entities.Post;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.services.PostService;
import com.adhissoncedeno.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @QueryMapping(name = "findAllPostsByUserId")
    public Iterable<Post> findAllPostsByUserId(@Argument("id") Long userId) {
        return postService.findByUserId(userId);
    }

    @QueryMapping(name = "findAllPosts")
    public Iterable<Post> findAll() {
        return postService.findAll();
    }


    @MutationMapping
    public String createPost(@Argument InputPost inputPost) {

        Post post = new Post();
        post.setTitle(inputPost.getTitle());
        post.setContent(inputPost.getContent());
        post.setPublic(inputPost.isPublic());

        if (inputPost.getUserId() != null) {
            User user = userService.findById(inputPost.getUserId());
            post.setUser(user);
        }

        postService.save(post);

        return "Post created";

    }

    @MutationMapping(name = "deletePostById")
    public String deletePost(@Argument(name = "id") Long id) {
        postService.deleteById(id);
        return "Post deleted";
    }


}

package com.adhissoncedeno.backend.controllers;


import com.adhissoncedeno.backend.graphql.InputUser;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @QueryMapping(name = "findUserById")
    public User findById(@Argument(name = "id") Long id) {
        return userService.findById(id);
    }

    @QueryMapping(name = "findAllUsers")
    public List<User> findAll() {
        return userService.findAll();
    }

    @MutationMapping
    public String createUser(@Argument InputUser inputUser) {

        User user = new User();
        user.setUsername(inputUser.getUsername());
        user.setPassword(inputUser.getPassword());
        user.setRole(inputUser.getRole());

        userService.save(user);
        return "User created";
    }

    @MutationMapping(name = "deleteUserById")
    public String deleteUser(@Argument(name = "id") Long id) {
        userService.deleteById(id);
        return "User deleted";
    }


}

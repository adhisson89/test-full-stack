package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.model.dtos.request.UserRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.UserResponseDTO;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.model.enums.Role;
import com.adhissoncedeno.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @QueryMapping(name = "findUserById")
    public User findById(@Argument(name = "id") Long id) {
        return userService.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @QueryMapping(name = "findAllUsers")
    public List<UserResponseDTO> findAll() {
        return userService.findAll();
    }

    @MutationMapping(name = "createUser")
    public UserResponseDTO createUser(@Argument(name = "userRequest") UserRequestDTO userRequest) {
        if (userRequest.getRole() == null) {
            userRequest.setRole(Role.USER);
        }
        return userService.create(userRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @MutationMapping(name = "deleteUserById")
    public String deleteUser(@Argument(name = "id") Long id) {
        userService.deleteById(id);
        return "User deleted";
    }
}
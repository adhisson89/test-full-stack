package com.adhissoncedeno.backend.model.dtos.response;


import com.adhissoncedeno.backend.model.enums.Role;

public class UserResponseDTO {
    private Long id;
    private String username;
    private Role role;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
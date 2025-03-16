package com.adhissoncedeno.backend.model.dtos.request;

import com.adhissoncedeno.backend.model.enums.Role;

public class UserRequestDTO {
    private String username;
    private String password;
    private Role role;


    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
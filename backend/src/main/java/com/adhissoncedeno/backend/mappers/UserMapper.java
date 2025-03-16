package com.adhissoncedeno.backend.mappers;

import com.adhissoncedeno.backend.model.dtos.request.UserRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.UserResponseDTO;
import com.adhissoncedeno.backend.model.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        return user;
    }

    public UserResponseDTO toDto(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole());
        return dto;
    }
}
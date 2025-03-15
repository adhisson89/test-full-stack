package com.adhissoncedeno.backend.services;

import com.adhissoncedeno.backend.mappers.UserMapper;
import com.adhissoncedeno.backend.model.dtos.request.UserRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.UserResponseDTO;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    public UserResponseDTO create(UserRequestDTO userRequestDTO) {
        User user = userMapper.toEntity(userRequestDTO);
        return userMapper.toDto(userRepository.save(user));
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
}
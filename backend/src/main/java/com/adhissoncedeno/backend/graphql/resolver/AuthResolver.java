package com.adhissoncedeno.backend.graphql.resolver;

import com.adhissoncedeno.backend.model.dtos.response.AuthResponseDTO;
import com.adhissoncedeno.backend.controllers.AuthController;
import com.adhissoncedeno.backend.model.dtos.request.AuthRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseEntity;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.Argument;

@Component
public class AuthResolver {

    @Autowired
    private AuthController authController;

    @MutationMapping
    public AuthResponseDTO login(@Argument String username, @Argument String password) {
        AuthRequestDTO request = new AuthRequestDTO();
        request.setUsername(username);
        request.setPassword(password);

        ResponseEntity<AuthResponseDTO> response = authController.login(request);
        return response.getBody();
    }
}
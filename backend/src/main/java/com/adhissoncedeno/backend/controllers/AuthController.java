package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.model.dtos.request.AuthRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.AuthResponseDTO;
import com.adhissoncedeno.backend.services.AuthService;
import com.adhissoncedeno.backend.services.CustomUserDetailsService;
import com.adhissoncedeno.backend.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

@Controller
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @MutationMapping
    public AuthResponseDTO login(@Argument String username, @Argument String password) {
        AuthRequestDTO request = new AuthRequestDTO();
        request.setUsername(username);
        request.setPassword(password);

        return authService.login(request);
    }

    @MutationMapping
    public AuthResponseDTO refreshToken(@Argument String refreshToken) {
        try {
            String username = jwtTokenUtil.extractUsername(refreshToken);
            UserDetails userDetails = ((CustomUserDetailsService) authService.getUserDetailsService())
                    .loadUserByUsername(username);

            return authService.refreshToken(refreshToken, userDetails);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token", e);
        }
    }
}
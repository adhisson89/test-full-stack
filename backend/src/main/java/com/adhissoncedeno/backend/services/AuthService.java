package com.adhissoncedeno.backend.services;

import com.adhissoncedeno.backend.model.dtos.request.AuthRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.AuthResponseDTO;
import com.adhissoncedeno.backend.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public AuthResponseDTO login(AuthRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenUtil.generateToken(userDetails);
        String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

        return new AuthResponseDTO(token, refreshToken);
    }

    public AuthResponseDTO refreshToken(String refreshToken, UserDetails userDetails) {
        if (jwtTokenUtil.validateToken(refreshToken, userDetails)) {
            String newToken = jwtTokenUtil.generateToken(userDetails);
            String newRefreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
            return new AuthResponseDTO(newToken, newRefreshToken);
        }
        return new AuthResponseDTO(null, null);
    }
}
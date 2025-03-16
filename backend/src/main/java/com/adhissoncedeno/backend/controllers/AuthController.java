package com.adhissoncedeno.backend.controllers;

import com.adhissoncedeno.backend.model.dtos.request.AuthRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.AuthResponseDTO;
import com.adhissoncedeno.backend.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String token = jwtTokenUtil.generateToken(userDetails);
        String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDTO(token, refreshToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody String refreshToken) {
        try {
            String username = jwtTokenUtil.extractUsername(refreshToken);
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            if (jwtTokenUtil.validateToken(refreshToken, userDetails)) {
                String newToken = jwtTokenUtil.generateToken(userDetails);
                String newRefreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

                return ResponseEntity.ok(new AuthResponseDTO(newToken, newRefreshToken));
            }

            return ResponseEntity.badRequest().body(new AuthResponseDTO(null, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponseDTO(null, null));
        }
    }
}
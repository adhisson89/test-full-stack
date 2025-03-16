package com.adhissoncedeno.backend.services;

import com.adhissoncedeno.backend.model.dtos.request.AuthRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.AuthResponseDTO;
import com.adhissoncedeno.backend.utils.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private AuthRequestDTO authRequestDTO;
    private UserDetails userDetails;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        authRequestDTO = new AuthRequestDTO();
        authRequestDTO.setUsername("testuser");
        authRequestDTO.setPassword("password");

        userDetails = new User(
            "testuser",
            "password",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    public void testLogin_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtTokenUtil.generateToken(userDetails)).thenReturn("jwt-token");
        when(jwtTokenUtil.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        AuthResponseDTO response = authService.login(authRequestDTO);

        assertEquals("jwt-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }

    @Test
    public void testRefreshToken_Valid() {
        String refreshToken = "valid-refresh-token";
        when(jwtTokenUtil.validateToken(refreshToken, userDetails)).thenReturn(true);
        when(jwtTokenUtil.generateToken(userDetails)).thenReturn("new-jwt-token");
        when(jwtTokenUtil.generateRefreshToken(userDetails)).thenReturn("new-refresh-token");

        AuthResponseDTO response = authService.refreshToken(refreshToken, userDetails);

        assertEquals("new-jwt-token", response.getToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
    }

    @Test
    public void testRefreshToken_Invalid() {
        String refreshToken = "invalid-refresh-token";
        when(jwtTokenUtil.validateToken(refreshToken, userDetails)).thenReturn(false);

        AuthResponseDTO response = authService.refreshToken(refreshToken, userDetails);

        assertNull(response.getToken());
        assertNull(response.getRefreshToken());
    }
}
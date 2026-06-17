package com.expensetracker.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // The frontend sends the token directly in the Authorization header (no "Bearer " prefix)
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && !authHeader.isBlank()) {
            // Strip "Bearer " prefix if present
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

            if (jwtUtil.isTokenValid(token)) {
                Long userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);

                // Create authentication with user ID as principal
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}

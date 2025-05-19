package com.mediumapp.blog_backend.config;

import com.mediumapp.blog_backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;

    // Danh sách các public endpoints để bỏ qua
    private final String[] publicEndpoints = {
            "/api/auth/**",
            "/api/posts",
            "/api/posts/**",
            "/api/tags/**",
            "/api/posts/search",
            "/api/view-all"
    };

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserRepository userRepo) {
        this.jwtUtils = jwtUtils;
        this.userRepo = userRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String path = req.getRequestURI();

        // Bỏ qua các endpoint public và các request OPTIONS (CORS preflight)
        for (String publicEndpoint : publicEndpoints) {
            if (req.getMethod().equals("OPTIONS") || isPathMatch(path, publicEndpoint)) {
                chain.doFilter(req, res);
                return;
            }
        }

        String authHeader = req.getHeader("Authorization");
        log.info("Authorization header: {}", authHeader);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("Extracted token: {}", token);
            try {
                String username = jwtUtils.extractUsername(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails ud = userRepo.findByUsername(username).orElse(null);
                    if (ud != null && jwtUtils.validateToken(token, ud)) {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                ud, null, ud.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.info("Authenticated user: {}", username);
                    }
                }
            } catch (Exception e) {
                log.error("Error processing JWT token: {}", e.getMessage());
            }
        } else {
            log.warn("No valid Bearer token found");
        }
        chain.doFilter(req, res);
    }

    // Hàm kiểm tra đường dẫn có khớp với pattern không
    private boolean isPathMatch(String path, String pattern) {
        if (pattern.endsWith("**")) {
            String basePattern = pattern.substring(0, pattern.length() - 2);
            return path.startsWith(basePattern);
        }
        return path.equals(pattern);
    }
}

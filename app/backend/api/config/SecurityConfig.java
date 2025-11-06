package com.covid19.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> {}) // active CORS (utilise ta CorsConfig)
            .csrf(csrf -> csrf.disable()) // désactivé en dev pour API
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // ⚠️ LIGNE MANQUANTE : autorise tous les endpoints
            );
        
        return http.build();
    }
}
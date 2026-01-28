package com.DAMUnitedFC.backend_tfg.config;

import com.DAMUnitedFC.backend_tfg.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
        System.out.println("🔒 [SECURITY CONFIG] Cargando configuración de seguridad...");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("🔓 [SECURITY] Aplicando reglas de acceso público a /api/uploads/**");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ESTA ES LA LÍNEA CLAVE PARA LAS IMÁGENES
                        // Rutas públicas
                        .requestMatchers("/api/uploads/**", "/uploads/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Aseguramos que todas las rutas de admin requieran autenticación (y no estén bloqueadas por defecto)
                        .requestMatchers("/api/admin/**").authenticated()

                        // Todo lo demás requiere login
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Permitir orígenes (El truco para el móvil es permitir localhost)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:8100", // Para pruebas en navegador local
                "http://localhost",      // 👈 IMPORTANTE: Origen interno de Android Capacitor
                "https://localhost",     // Por si acaso en iOS
                "capacitor://localhost"  // Origen nativo a veces usado
        ));

        // 2. Permitir métodos HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 3. Permitir cabeceras (especialmente Authorization para el Token)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));

        // 4. Permitir credenciales
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
package com.DAMUnitedFC.backend_tfg.config;

import com.DAMUnitedFC.backend_tfg.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // 👈 IMPORTANTE: Asegúrate de tener este import
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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
        System.out.println("🔒 [SECURITY CONFIG] Cargando configuración de seguridad blindada...");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("🔓 [SECURITY] Aplicando reglas de acceso y CORS...");

        http
                // 1. CORS: Configuración de orígenes cruzados (Móvil/Web)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF: Desactivar obligatoriamente para APIs REST
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Reglas de Autorización
                .authorizeHttpRequests(auth -> auth
                        // IMPORTANTE: Permitir peticiones 'preflight' (OPTIONS) de cualquier origen
                        // Esto evita muchos errores 403 "misteriosos" en CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Rutas Públicas (Login, Registro, Imágenes, Swagger)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/uploads/**", "/uploads/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Rutas Protegidas (Admin y General)
                        .requestMatchers("/api/admin/**").authenticated()

                        // Cualquier otra cosa requiere Token
                        .anyRequest().authenticated()
                )

                // 4. Sesión Stateless (Sin cookies)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // LISTA DE ORÍGENES PERMITIDOS
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:4200", // web Angular local
                "http://localhost:8100", // Ionic serve
                "http://localhost",      // Android Capacitor (interno)
                "https://localhost",     // iOS
                "capacitor://localhost"  // Capacitor Nativo
        ));

        // MÉTODOS PERMITIDOS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // CABECERAS PERMITIDAS
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Allow-Origin"
        ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
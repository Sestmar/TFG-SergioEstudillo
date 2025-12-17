package com.DAMUnitedFC.backend_tfg.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String SECRET_KEY;

    // 1. Obtener el username del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Obtener un dato específico (claim) del token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 3. Generar el token (Sintaxis actualizada para v0.12.3)
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(getSignInKey(), Jwts.SIG.HS256) // Cambio importante aquí
                .compact();
    }

    // 4. Validar el token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 5. Parsear el token para leer los datos (Sintaxis actualizada)
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Antes era setSigningKey
                .build()                    // Nuevo paso obligatorio
                .parseSignedClaims(token)   // Antes era parseClaimsJws
                .getPayload();              // Antes era getBody
    }

    // 6. Método auxiliar para decodificar la clave secreta (Nuevo y obligatorio)
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
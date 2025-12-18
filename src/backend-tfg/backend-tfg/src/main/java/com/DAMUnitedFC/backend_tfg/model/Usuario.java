package com.DAMUnitedFC.backend_tfg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 70)
    private String apellidos;

    @Column(unique = true, nullable = false, length = 120)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // ✅ EVITA que la contraseña viaje al frontend (Seguridad + Evita error)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String rol;

    @Column(nullable = false)
    private java.sql.Date fechaAlta;

    @Column(name = "foto_url")
    private String fotoUrl;

    private String telefono;
    private String direccion;

    // --- MÉTODOS DE SEGURIDAD (UserDetails) ---
    // Añadimos @JsonIgnore a todos para que no ensucien el JSON ni rompan la serialización

    @Override
    @JsonIgnore // ✅ Ignoramos esto porque el frontend ya tiene el campo "rol"
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.rol == null) return List.of(); // Protección contra nulos
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol));
    }

    @Override
    @JsonIgnore // ✅ Ya ignoramos el campo passwordHash arriba
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    @JsonIgnore // ✅ El frontend ya tiene el campo "email"
    public String getUsername() {
        return this.email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }
}
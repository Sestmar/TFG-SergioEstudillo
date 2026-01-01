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

    // 🔙 REVERTIDO A passwordHash (Como estaba antes)
    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String rol;

    @Column(nullable = false)
    private java.sql.Date fechaAlta;

    @Column(name = "foto_url")
    private String fotoUrl;

    private String telefono;
    private String direccion;

    // Helper útil para el Admin (lo mantenemos porque no rompe nada)
    public void setFechaRegistro(java.util.Date fecha) {
        this.fechaAlta = new java.sql.Date(fecha.getTime());
    }

    // Seguridad
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.rol == null) return List.of();
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return this.email;
    }

    @Override @JsonIgnore public boolean isAccountNonExpired() { return true; }
    @Override @JsonIgnore public boolean isAccountNonLocked() { return true; }
    @Override @JsonIgnore public boolean isCredentialsNonExpired() { return true; }
    @Override @JsonIgnore public boolean isEnabled() { return true; }
}
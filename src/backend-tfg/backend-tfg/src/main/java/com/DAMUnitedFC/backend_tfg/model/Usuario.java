package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
public class Usuario implements UserDetails { // AÑADIDO: implements UserDetails

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
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String rol;

    @Column(nullable = false)
    private java.sql.Date fechaAlta;

    private String telefono;
    private String direccion;

    // --- MÉTODOS DE SEGURIDAD (UserDetails) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convierte el texto de tu BD (ej: "ENTRENADOR") en un objeto de autoridad
        // Si tu rol puede ser null, deberíamos controlarlo, pero has puesto nullable=false :)
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol));
    }

    @Override
    public String getPassword() {
        return this.passwordHash; // Spring usa este campo para validar la contraseña
    }

    @Override
    public String getUsername() {
        return this.email; // Spring usa el email como identificador único
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // La cuenta nunca caduca
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // La cuenta nunca se bloquea
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Las credenciales no caducan
    }

    @Override
    public boolean isEnabled() {
        return true; // El usuario siempre está activo
    }
}
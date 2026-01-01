package com.DAMUnitedFC.backend_tfg.security;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Usuario usuario;

    public CustomUserDetails(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Aseguramos compatibilidad con ROLE_
        String rol = usuario.getRol();
        if (!rol.startsWith("ROLE_")) {
            rol = "ROLE_" + rol;
        }
        return Collections.singletonList(new SimpleGrantedAuthority(rol));
    }

    @Override
    public String getPassword() {
        // 🔥 REVERTIDO: Devuelve el campo original de la BBDD
        return usuario.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail(); // El username de login es el email
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.security.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registerNewUser(RegistroUsuario registroDto) {
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }
        Usuario newUser = new Usuario();
        newUser.setNombre(registroDto.getNombre());
        newUser.setApellidos(registroDto.getApellidos());
        newUser.setEmail(registroDto.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));
        newUser.setRol("JUGADOR");
        long millis = System.currentTimeMillis();
        newUser.setFechaAlta(new java.sql.Date(millis));
        newUser.setTelefono(registroDto.getTelefono());
        return usuarioRepository.save(newUser);
    }

    public UserDetails authenticateUser(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return new CustomUserDetails(usuario);
    }
}
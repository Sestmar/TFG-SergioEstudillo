package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registerNewUser(RegistroUsuario registroDto) {
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }

        Usuario newUser = new Usuario();
        newUser.setNombre(registroDto.getNombre());
        newUser.setApellidos(registroDto.getApellidos());
        newUser.setEmail(registroDto.getEmail());

        // 🔥 REVERTIDO: Volvemos a usar el nombre original del campo
        newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));

        newUser.setRol("JUGADOR"); // Rol por defecto
        newUser.setTelefono(registroDto.getTelefono());

        // Mantenemos el helper de fecha que añadimos a Usuario.java (es inofensivo y útil)
        newUser.setFechaRegistro(new Date());

        return usuarioRepository.save(newUser);
    }

    public UserDetails authenticateUser(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));

        // 🔥 REVERTIDO: Volvemos a usar el nombre original del campo
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return new CustomUserDetails(usuario);
    }
}
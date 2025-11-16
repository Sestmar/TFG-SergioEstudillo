package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario; // <-- CAMBIO: Importamos tu DTO
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
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

    // ===> CAMBIO CLAVE: El método ahora recibe tu DTO 'RegistroUsuario' <===
    public Usuario registerNewUser(RegistroUsuario registroDto) {
        // 1. Comprobar si el email ya existe
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }

        // 2. Crear la entidad Usuario a partir del DTO
        Usuario newUser = new Usuario();
        newUser.setNombre(registroDto.getNombre());
        newUser.setApellidos(registroDto.getApellidos());
        newUser.setEmail(registroDto.getEmail());

        // ===> LA SOLUCIÓN FINAL: Leemos la contraseña del DTO y la hasheamos <===
        newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));

        // 3. Asignar valores por defecto
        newUser.setRol("JUGADOR");
        long millis = System.currentTimeMillis();
        newUser.setFechaAlta(new java.sql.Date(millis));
        newUser.setTelefono(registroDto.getTelefono()); // Añadimos el teléfono que viene en el DTO

        // 4. Guardar y devolver la nueva entidad
        return usuarioRepository.save(newUser);
    }
}
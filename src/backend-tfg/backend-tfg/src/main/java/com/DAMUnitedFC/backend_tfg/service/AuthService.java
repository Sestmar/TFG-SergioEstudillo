package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Entrenador; // Importante
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.EntrenadorRepository; // Importante
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante para consistencia

import java.util.Date;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EntrenadorRepository entrenadorRepository; //

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional // Si falla crear el entrenador, que no se cree el usuario
    public Usuario registerNewUser(RegistroUsuario registroDto) {
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }

        Usuario newUser = new Usuario();
        newUser.setNombre(registroDto.getNombre());
        newUser.setApellidos(registroDto.getApellidos());
        newUser.setEmail(registroDto.getEmail().trim().toLowerCase());
        newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));
        newUser.setTelefono(registroDto.getTelefono());
        newUser.setFechaRegistro(new Date());

        // LOGICA DE ROL
        // Si viene nulo, por defecto JUGADOR, si no, lo que venga (en mayúsculas por seguridad)
        String rolAsignado = (registroDto.getRol() != null && !registroDto.getRol().isEmpty())
                ? registroDto.getRol().toUpperCase()
                : "JUGADOR";

        newUser.setRol(rolAsignado);

        Usuario savedUser = usuarioRepository.save(newUser);

        // SI ES ENTRENADOR, CREAMOS LA ENTIDAD ENTRENADOR AUTOMÁTICAMENTE
        if ("ENTRENADOR".equals(rolAsignado) || "ROLE_COACH".equals(rolAsignado)) {
            createEmptyCoachProfile(savedUser);
        }

        // (Opcional) Aquí podrías añadir un else if ("JUGADOR") para crear la entidad Jugador si hiciera falta

        return savedUser;
    }

    private void createEmptyCoachProfile(Usuario usuario) {
        Entrenador entrenador = new Entrenador();
        entrenador.setUsuario(usuario);
        // Fecha de alta ya se pone en el constructor de Entrenador que me pasaste
        // No asignamos equipo todavía -> Se queda "En el limbo" listo para asignar
        entrenadorRepository.save(entrenador);
    }

    // Mantengo el método authenticateUser tal cual lo tenía
    public UserDetails authenticateUser(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return new CustomUserDetails(usuario);
    }
}
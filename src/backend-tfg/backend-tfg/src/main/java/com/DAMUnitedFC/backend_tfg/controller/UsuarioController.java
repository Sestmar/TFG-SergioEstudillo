package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AuthResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.PasswordResetToken;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.PasswordResetTokenRepository;
import com.DAMUnitedFC.backend_tfg.service.AuthService;
import com.DAMUnitedFC.backend_tfg.service.EmailService;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
import com.DAMUnitedFC.backend_tfg.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Responsabilidad: autenticación y gestión de identidad (register, login, forgot-password, me).
 * Las rutas CRUD de usuarios (/api/usuarios) están en UserController.
 */
@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UsuarioService usuarioService;
    private final PasswordResetTokenRepository tokenRepository;

    public UsuarioController(AuthService authService,
                             JwtService jwtService,
                             AuthenticationManager authenticationManager,
                             EmailService emailService,
                             UsuarioService usuarioService,
                             PasswordResetTokenRepository tokenRepository) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.usuarioService = usuarioService;
        this.tokenRepository = tokenRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistroUsuario registroDto) {
        try {
            if (registroDto.getEmail() != null) {
                registroDto.setEmail(registroDto.getEmail().trim().toLowerCase());
            }
            Usuario newUser = authService.registerNewUser(registroDto);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Siempre devolvemos el mismo mensaje para no revelar si el email existe
        var usuarioOpt = usuarioService.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Si el email existe, se han enviado las instrucciones."));
        }

        Usuario usuario = usuarioOpt.get();

        // Eliminar tokens previos de este usuario
        tokenRepository.deleteByUsuario(usuario);

        // Generar token seguro con expiración de 60 minutos
        String resetToken = UUID.randomUUID().toString();
        tokenRepository.save(new PasswordResetToken(resetToken, usuario));

        // Enviar email — si falla, @Transactional revierte el token guardado
        String resetLink = "https://tfg-dam-united-web.onrender.com/auth/reset-password?token=" + resetToken;
        emailService.sendEmail(
                email,
                "Recuperación de Contraseña - DAM United FC",
                "Hola " + usuario.getNombre() + ",\n\n" +
                        "Se ha solicitado un cambio de contraseña para tu cuenta.\n\n" +
                        "Hacé clic en el siguiente enlace para restablecer tu contraseña:\n" +
                        resetLink + "\n\n" +
                        "Este enlace expira en 60 minutos.\n" +
                        "Si no solicitaste este cambio, ignorá este mensaje."
        );

        return ResponseEntity.ok(Map.of("message", "Si el email existe, se han enviado las instrucciones."));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 8 caracteres."));
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null || resetToken.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El enlace es inválido o ha expirado."));
        }

        // Cambiar contraseña
        usuarioService.resetPassword(resetToken.getUsuario().getEmail(), newPassword);

        // Eliminar token usado
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto) {
        try {
            String emailLimpio = loginDto.getEmail() != null ? loginDto.getEmail().trim().toLowerCase() : "";

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(emailLimpio, loginDto.getPassword())
            );

            Usuario user = usuarioService.findByEmail(emailLimpio)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(AuthResponseDto.builder().token(token).build());

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/users")
    public List<Usuario> getAllUsuarios() {
        return usuarioService.listar();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyself(Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario user = usuarioService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}

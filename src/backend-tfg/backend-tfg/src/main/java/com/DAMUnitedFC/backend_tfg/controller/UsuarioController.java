package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AuthResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
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

    public UsuarioController(AuthService authService,
                             JwtService jwtService,
                             AuthenticationManager authenticationManager,
                             EmailService emailService,
                             UsuarioService usuarioService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroUsuario registroDto) {
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
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Usuario usuario = usuarioService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        usuarioService.resetPassword(email, tempPassword);

        try {
            emailService.sendEmail(
                    email,
                    "Recuperación de Contraseña - Tu Club de Fútbol",
                    "Hola " + usuario.getNombre() + ",\n\n" +
                            "Tu nueva contraseña temporal es: " + tempPassword + "\n\n" +
                            "Por favor, entra en la app y cámbiala lo antes posible."
            );
        } catch (Exception e) {
            // Email no enviado — se continúa sin interrumpir el flujo
        }

        return ResponseEntity.ok(Map.of("message", "Si el email existe, se han enviado las instrucciones."));
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

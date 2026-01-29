package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AuthResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.AuthService;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.DAMUnitedFC.backend_tfg.service.EmailService;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    @Autowired
    private EmailService emailService;

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository,
                             AuthService authService,
                             JwtService jwtService,
                             AuthenticationManager authenticationManager,
                             PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
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
    @Transactional // 🛡️ ESCUDO: Si el email falla, esto deshace el cambio de contraseña
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // 👁️ CHIVATO: Imprimimos la contraseña en los logs de Render por si el email falla
        System.out.println("⚠️ RECUPERACIÓN SOLICITADA PARA: " + email);
        System.out.println("🔑 NUEVA CONTRASEÑA GENERADA (Copiar si el email falla): " + tempPassword);

        // 1. Guardamos en DB
        usuario.setPasswordHash(passwordEncoder.encode(tempPassword));
        usuarioRepository.save(usuario);

        // 2. Enviamos el email
        try {
            emailService.sendEmail(
                    email,
                    "Recuperación de Contraseña - Tu Club de Fútbol",
                    "Hola " + usuario.getNombre() + ",\n\n" +
                            "Tu nueva contraseña temporal es: " + tempPassword + "\n\n" +
                            "Por favor, entra en la app y cámbiala lo antes posible."
            );
        } catch (Exception e) {
            // 🚨 Si falla el email, lanzamos un error para que @Transactional deshaga el cambio en la DB
            System.out.println("❌ ERROR ENVIANDO EMAIL: " + e.getMessage());
            throw new RuntimeException("No se pudo enviar el email. La contraseña NO se ha cambiado.");
        }

        return ResponseEntity.ok(Map.of("message", "Email enviado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto) {
        try {
            String emailLimpio = "";
            if (loginDto.getEmail() != null) {
                emailLimpio = loginDto.getEmail().trim().toLowerCase();
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            emailLimpio,
                            loginDto.getPassword()
                    )
            );

            Usuario user = usuarioRepository.findByEmail(emailLimpio)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(AuthResponseDto.builder()
                    .token(token)
                    .build());

        } catch (AuthenticationException e) {
            System.out.println("❌ Error de autenticación para: " + loginDto.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/users")
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyself(Authentication authentication) {
        try {
            String email = authentication.getName();
            Usuario user = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}
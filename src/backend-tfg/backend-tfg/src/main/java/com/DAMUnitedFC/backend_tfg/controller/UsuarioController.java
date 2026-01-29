package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AuthResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.AuthService;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
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
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // 1. Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Generar contraseña temporal aleatoria (8 caracteres)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // 3. Actualizar usuario con la nueva contraseña (¡ENCRIPTADA!)
        // Como dijiste, tu entidad usa 'passwordHash', así que usamos ese setter.
        usuario.setPasswordHash(passwordEncoder.encode(tempPassword));
        usuarioRepository.save(usuario);

        // 4. Enviar email
        emailService.sendEmail(
                email,
                "Recuperación de Contraseña - Tu Club de Fútbol",
                "Hola " + usuario.getNombre() + ",\n\n" +
                        "Hemos recibido una solicitud para restablecer tu contraseña.\n" +
                        "Tu nueva contraseña temporal es: " + tempPassword + "\n\n" +
                        "Por favor, inicia sesión y cámbiala lo antes posible desde tu perfil."
        );

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
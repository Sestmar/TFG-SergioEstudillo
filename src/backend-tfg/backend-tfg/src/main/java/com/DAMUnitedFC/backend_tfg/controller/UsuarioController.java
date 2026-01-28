package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AuthResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.AuthService;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UsuarioController(UsuarioRepository usuarioRepository,
                             AuthService authService,
                             JwtService jwtService,
                             AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroUsuario registroDto) {
        try {
            // 🧹 LIMPIEZA PREVENTIVA: Guardamos siempre en minúsculas y sin espacios
            if (registroDto.getEmail() != null) {
                registroDto.setEmail(registroDto.getEmail().trim().toLowerCase());
            }

            Usuario newUser = authService.registerNewUser(registroDto);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto) {
        try {
            // 🧹 LIMPIEZA CRÍTICA: El usuario puede escribir " Sergio@Gmail.com "
            // Nosotros lo convertimos a "sergio@gmail.com" antes de buscar.
            String emailLimpio = "";

            if (loginDto.getEmail() != null) {
                emailLimpio = loginDto.getEmail().trim().toLowerCase();
            }

            // 1. Validar credenciales usando el email limpio
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            emailLimpio,
                            loginDto.getPassword()
                    )
            );

            // 2. Si la autenticación pasa, buscamos al usuario
            Usuario user = usuarioRepository.findByEmail(emailLimpio)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 3. Generar Token
            String token = jwtService.generateToken(user);

            // 4. Obtener roles de forma segura (para enviarlos en el login si quieres, o dejarlo como estaba)
            // Tu AuthResponseDto parece que solo pide token, así que lo dejamos así.
            return ResponseEntity.ok(AuthResponseDto.builder()
                    .token(token)
                    .build());

        } catch (AuthenticationException e) {
            // Este es el error 403 que veías. Ahora saltará mucho menos.
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
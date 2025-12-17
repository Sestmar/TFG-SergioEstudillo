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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager; // Nueva inyección necesaria

    // Constructor actualizado con AuthenticationManager
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
            Usuario newUser = authService.registerNewUser(registroDto);
            // Opcional: Podrías devolver también el token aquí si quisieras autologin al registrar
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto) {
        try {
            // 1. Validar credenciales usando AuthenticationManager (Estándar de Spring Security)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail(),
                            loginDto.getPassword()
                    )
            );

            // 2. Si la autenticación pasa, buscamos al usuario para generar el token
            // Buscamos por email, lanzamos error si no existe (aunque authManager ya lo habrá validado)
            Usuario user = usuarioRepository.findByEmail(loginDto.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 3. Generar el Token compatible con la v0.12.3
            String token = jwtService.generateToken(user);

            // 4. Devolver la respuesta usando tu DTO
            return ResponseEntity.ok(AuthResponseDto.builder()
                    .token(token)
                    .build());

        } catch (AuthenticationException e) {
            // Si la contraseña o usuario están mal, salta esto
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
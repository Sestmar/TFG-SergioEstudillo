package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.LoginDto;
import com.DAMUnitedFC.backend_tfg.dto.RegistroUsuario;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.AuthService;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;
    private final JwtService jwtService;

    public UsuarioController(UsuarioRepository usuarioRepository, AuthService authService, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroUsuario registroDto) {
        try {
            Usuario newUser = authService.registerNewUser(registroDto);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            UserDetails user = authService.authenticateUser(loginDto.getEmail(), loginDto.getPassword());
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/users")
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }
}
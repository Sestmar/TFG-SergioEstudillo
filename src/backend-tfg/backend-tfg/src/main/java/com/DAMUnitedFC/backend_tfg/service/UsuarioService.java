package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtener(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario resetPassword(String email, String newRawPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setPasswordHash(passwordEncoder.encode(newRawPassword));
        return usuarioRepository.save(usuario);
    }

    public void actualizarFcmToken(String email, String fcmToken) {
        usuarioRepository.findByEmail(email).ifPresent(usuario -> {
            usuario.setFcmToken(fcmToken);
            usuarioRepository.save(usuario);
        });
    }

    public Optional<Usuario> actualizar(Integer id, Map<String, Object> updates) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario usuarioActual) {
            boolean esAdmin = usuarioActual.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!esAdmin && !usuarioActual.getIdUsuario().equals(id)) {
                throw new AccessDeniedException("No tenés permiso para modificar este usuario.");
            }
        }
        return usuarioRepository.findById(id).map(usuario -> {
            if (updates.containsKey("nombre")) usuario.setNombre((String) updates.get("nombre"));
            if (updates.containsKey("apellidos")) usuario.setApellidos((String) updates.get("apellidos"));
            if (updates.containsKey("telefono")) {
                usuario.setTelefono((String) (updates.get("telefono") != null ? updates.get("telefono") : updates.get("telefonoContacto")));
            }
            if (updates.containsKey("direccion")) usuario.setDireccion((String) updates.get("direccion"));
            if (updates.containsKey("fotoUrl")) usuario.setFotoUrl((String) updates.get("fotoUrl"));
            return usuarioRepository.save(usuario);
        });
    }
}

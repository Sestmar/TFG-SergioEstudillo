package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtener(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> actualizar(Integer id, Map<String, Object> updates) {
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

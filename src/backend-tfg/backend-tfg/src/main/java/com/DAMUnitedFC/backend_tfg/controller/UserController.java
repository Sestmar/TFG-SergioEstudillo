package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/** Este se encargará de recibir las peticiones en /api/usuarios, separando la lógica de "Gestión de Recursos" de la de "Autenticación".
 Aquí implementamos el PUT que necesita el frontend para guardar la foto y los datos del perfil.
 *
 */

@RestController
@RequestMapping("/api/usuarios") // ✅ Esta es la ruta que busca tu frontend
@CrossOrigin(origins = "*")      // ✅ Permite peticiones desde Ionic/Angular
public class UserController {

    private final UsuarioRepository usuarioRepository;

    public UserController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Obtener todos (Opcional, útil para admin)
    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    // Obtener uno por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔥 EL MÉTODO QUE TE FALTABA: Actualizar Usuario (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    // Actualizamos solo los campos que nos envíen
                    if (updates.containsKey("nombre")) {
                        usuario.setNombre((String) updates.get("nombre"));
                    }
                    if (updates.containsKey("apellidos")) {
                        usuario.setApellidos((String) updates.get("apellidos"));
                    }
                    if (updates.containsKey("telefono")) { // Frontend envía 'telefonoContacto' o 'telefono', ajustamos aquí
                        usuario.setTelefono((String) (updates.get("telefono") != null ? updates.get("telefono") : updates.get("telefonoContacto")));
                    }
                    if (updates.containsKey("direccion")) {
                        usuario.setDireccion((String) updates.get("direccion"));
                    }

                    // ✅ AQUÍ SE GUARDA LA FOTO
                    if (updates.containsKey("fotoUrl")) {
                        usuario.setFotoUrl((String) updates.get("fotoUrl"));
                    }

                    // Guardamos en BD
                    Usuario actualizado = usuarioRepository.save(usuario);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
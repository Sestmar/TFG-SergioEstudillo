package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.repository.EntrenadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoEntrenadorRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {

    private final EntrenadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoEntrenadorRepository equipoEntrenadorRepo;

    // Inyección de dependencias (Ahora incluimos equipoEntrenadorRepo)
    public EntrenadorController(EntrenadorRepository repo, UsuarioRepository usuarioRepo, EquipoEntrenadorRepository equipoEntrenadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoEntrenadorRepo = equipoEntrenadorRepo;
    }

    // --- CRUD BÁSICO ---

    @GetMapping
    public List<Entrenador> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    @PostMapping
    public Entrenador crear(@RequestBody EntrenadorDto dto) {
        Entrenador e = new Entrenador();
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());
        // Controlamos nulos en la fecha por seguridad
        if (dto.getFechaAlta() != null) {
            e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        } else {
            e.setFechaAlta(new Date(System.currentTimeMillis())); // Fecha actual por defecto
        }
        return repo.save(e);
    }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorDto dto) {
        Entrenador e = repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());
        if (dto.getFechaAlta() != null) {
            e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        }
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    // --- ✅ NUEVO ENDPOINT: DETECCIÓN DE EQUIPO POR USUARIO ---

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelUsuario(@PathVariable Integer idUsuario) {
        // 1. Buscar si este usuario es entrenador
        Optional<Entrenador> entrenadorOpt = repo.findByUsuario_IdUsuario(idUsuario);

        if (entrenadorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Este usuario no está registrado como entrenador.");
        }

        Entrenador entrenador = entrenadorOpt.get();

        // 2. Buscar qué equipos gestiona este entrenador
        List<EquipoEntrenador> asignaciones = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entrenador.getIdEntrenador());

        if (asignaciones.isEmpty()) {
            return ResponseEntity.status(404).body("El entrenador no tiene ningún equipo asignado.");
        }

        // 3. Devolvemos el PRIMER equipo que encontremos (Objeto Equipo limpio)
        Equipo miEquipo = asignaciones.get(0).getEquipo();

        return ResponseEntity.ok(miEquipo);
    }
}
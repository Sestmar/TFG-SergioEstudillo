package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.repository.EntrenadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoEntrenadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entrenadores")
@CrossOrigin(origins = "*")
public class EntrenadorController {

    private final EntrenadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final EquipoEntrenadorRepository equipoEntrenadorRepo;

    @Autowired
    public EntrenadorController(EntrenadorRepository repo,
                                UsuarioRepository usuarioRepo,
                                EquipoRepository equipoRepo,
                                EquipoEntrenadorRepository equipoEntrenadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.equipoEntrenadorRepo = equipoEntrenadorRepo;
    }

    // --- CRUD BÁSICO ---

    @GetMapping
    public List<Entrenador> listar() {
        return repo.findAll();
    }

    // 🔥 NUEVO ENDPOINT: Para cargar la lista en "Solicitudes" o "Asignar Entrenador"
    @GetMapping("/sin-equipo")
    public ResponseEntity<List<Entrenador>> listarSinEquipo() {
        return ResponseEntity.ok(repo.findEntrenadoresSinEquipo());
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    @PostMapping
    public Entrenador crear(@RequestBody EntrenadorDto dto) {
        Entrenador e = new Entrenador();
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());

        if (dto.getFechaAlta() != null) {
            e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        } else {
            e.setFechaAlta(new Date(System.currentTimeMillis()));
        }
        return repo.save(e);
    }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorDto dto) {
        Entrenador e = repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
        if(dto.getIdUsuario() != null) {
            e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }
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

    // --- LOGICA DE EQUIPO Y ROL ---

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelUsuario(@PathVariable Integer idUsuario) {

        Optional<Entrenador> entrenadorOpt = repo.findByUsuario_IdUsuario(idUsuario);
        if (entrenadorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Este usuario no es entrenador.");
        }
        Entrenador entrenador = entrenadorOpt.get();

        // 1. Buscar en Staff (Tabla Intermedia)
        List<EquipoEntrenador> staffAssignments = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entrenador.getIdEntrenador());

        if (!staffAssignments.isEmpty()) {
            EquipoEntrenador asignacion = staffAssignments.get(0);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("equipo", asignacion.getEquipo());
            response.put("rol", asignacion.getRol());
            response.put("entrenadorId", entrenador.getIdEntrenador());

            return ResponseEntity.ok(response);
        }

        // 2. Buscar como Jefe Directo (Legacy)
        Optional<Equipo> equipoJefe = equipoRepo.findByEntrenador_Usuario_IdUsuario(idUsuario);

        if (equipoJefe.isPresent()) {
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("equipo", equipoJefe.get());
            response.put("rol", "Entrenador Principal");
            response.put("entrenadorId", entrenador.getIdEntrenador());

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(404).body("Sin asignación de equipo.");
    }
}
package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
@CrossOrigin(origins = "*")
public class JugadorController {

    private final JugadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final AlineacionRepository alineacionRepo;

    public JugadorController(JugadorRepository repo,
                             UsuarioRepository usuarioRepo,
                             EquipoRepository equipoRepo,
                             AlineacionRepository alineacionRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.alineacionRepo = alineacionRepo;
    }

    // --- ENDPOINTS EXISTENTES ---

    @GetMapping
    public List<Jugador> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Jugador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

    @PostMapping
    public Jugador crear(@RequestBody JugadorDto dto) {
        Jugador j = new Jugador();
        return guardarOActualizar(j, dto);
    }

    @PutMapping("/{id}")
    public Jugador actualizar(@PathVariable Integer id, @RequestBody JugadorDto dto) {
        Jugador j = repo.findById(id).orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
        return guardarOActualizar(j, dto);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    // --- ESTADÍSTICAS ---
    @GetMapping("/{id}/stats")
    public EstadisticasJugadorDto obtenerEstadisticas(@PathVariable Integer id) {
        Integer partidos = alineacionRepo.countPartidosJugados(id);
        Integer goles = alineacionRepo.sumGoles(id);
        Integer asistencias = alineacionRepo.sumAsistencias(id);
        Integer minutos = alineacionRepo.sumMinutos(id);

        return new EstadisticasJugadorDto(
                (partidos != null) ? partidos : 0,
                (goles != null) ? goles : 0,
                (asistencias != null) ? asistencias : 0,
                (minutos != null) ? minutos : 0
        );
    }

    // --- DASHBOARD JUGADOR ---
    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelJugador(@PathVariable Long idUsuario) {
        return repo.findByUsuario_IdUsuario(idUsuario)
                .map(jugador -> {
                    if (jugador.getEquipoPrincipal() != null) {
                        return ResponseEntity.ok(jugador.getEquipoPrincipal());
                    } else {
                        return ResponseEntity.notFound().build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- MÉTODOS AUXILIARES ---

    private Jugador guardarOActualizar(Jugador j, JugadorDto dto) {
        // Conversión Long -> int para Usuario
        if (dto.getIdUsuario() != null) {
            j.setUsuario(usuarioRepo.findById(dto.getIdUsuario().intValue())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }

        // Fechas y Datos
        j.setFechaNacimiento(dto.getFechaNacimiento() != null ? Date.valueOf(dto.getFechaNacimiento()) : null);
        j.setFechaAlta(dto.getFechaAlta() != null ? Date.valueOf(dto.getFechaAlta()) : null);
        j.setFechaBaja(dto.getFechaBaja() != null ? Date.valueOf(dto.getFechaBaja()) : null);

        j.setPosicion(dto.getPosicion());
        j.setDorsal(dto.getDorsal());
        j.setEstado(dto.getEstado());
        j.setTelefonoContacto(dto.getTelefonoContacto());
        j.setDireccion(dto.getDireccion());
        j.setObservaciones(dto.getObservaciones());

        // 🔥 CORRECCIÓN AQUÍ: Conversión Long -> int para Equipo
        if (dto.getEquipoPrincipal() != null) {
            // Añadido .intValue() al final del get
            Equipo e = equipoRepo.findById(dto.getEquipoPrincipal().intValue()).orElse(null);
            j.setEquipoPrincipal(e);
        } else {
            j.setEquipoPrincipal(null);
        }

        return repo.save(j);
    }
}
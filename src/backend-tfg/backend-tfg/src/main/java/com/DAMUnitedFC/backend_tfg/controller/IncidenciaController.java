package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.IncidenciaDto;
import com.DAMUnitedFC.backend_tfg.model.Incidencia;
import com.DAMUnitedFC.backend_tfg.repository.IncidenciaRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    private final IncidenciaRepository repo;
    private final JugadorRepository jugadorRepo;
    private final UsuarioRepository usuarioRepo;

    public IncidenciaController(IncidenciaRepository repo, JugadorRepository jugadorRepo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.jugadorRepo = jugadorRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping
    public List<Incidencia> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Incidencia obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
    }

    @PostMapping
    public Incidencia crear(@RequestBody IncidenciaDto dto) {
        Incidencia i = new Incidencia();
        i.setJugador(dto.getIdJugador() != null ? jugadorRepo.findById(dto.getIdJugador()).orElse(null) : null);
        i.setUsuario(dto.getIdUsuario() != null ? usuarioRepo.findById(dto.getIdUsuario()).orElse(null) : null);
        i.setFechaReporte(Date.valueOf(dto.getFechaReporte()));
        i.setTipo(dto.getTipo());
        i.setEstado(dto.getEstado());
        i.setDescripcion(dto.getDescripcion());
        return repo.save(i);
    }

    @PutMapping("/{id}")
    public Incidencia actualizar(@PathVariable Integer id, @RequestBody IncidenciaDto dto) {
        Incidencia i = repo.findById(id).orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
        i.setJugador(dto.getIdJugador() != null ? jugadorRepo.findById(dto.getIdJugador()).orElse(null) : null);
        i.setUsuario(dto.getIdUsuario() != null ? usuarioRepo.findById(dto.getIdUsuario()).orElse(null) : null);
        i.setFechaReporte(Date.valueOf(dto.getFechaReporte()));
        i.setTipo(dto.getTipo());
        i.setEstado(dto.getEstado());
        i.setDescripcion(dto.getDescripcion());
        return repo.save(i);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
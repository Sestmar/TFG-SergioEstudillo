package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.JugadorEquipoDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jugador-equipo")
public class JugadorEquipoController {

    private final JugadorEquipoRepository repo;
    private final JugadorRepository jugadorRepo;
    private final EquipoRepository equipoRepo;

    public JugadorEquipoController(JugadorEquipoRepository repo, JugadorRepository jugadorRepo, EquipoRepository equipoRepo) {
        this.repo = repo;
        this.jugadorRepo = jugadorRepo;
        this.equipoRepo = equipoRepo;
    }

    @GetMapping
    public List<JugadorEquipo> listar() {
        return repo.findAll();
    }

    @PostMapping
    public JugadorEquipo crear(@RequestBody JugadorEquipoDto dto) {
        JugadorEquipo je = new JugadorEquipo();
        JugadorEquipoId id = new JugadorEquipoId();
        id.setIdJugador(dto.getIdJugador());
        id.setIdEquipo(dto.getIdEquipo());
        je.setId(id);
        je.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        je.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        je.setObservacion(dto.getObservacion());
        return repo.save(je);
    }

    @DeleteMapping("/{idJugador}/{idEquipo}")
    public void borrar(@PathVariable Integer idJugador, @PathVariable Integer idEquipo) {
        JugadorEquipoId id = new JugadorEquipoId();
        id.setIdJugador(idJugador);
        id.setIdEquipo(idEquipo);
        repo.deleteById(id);
    }
}
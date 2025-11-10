package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EquipoEntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipo-entrenador")
public class EquipoEntrenadorController {

    private final EquipoEntrenadorRepository repo;
    private final EquipoRepository equipoRepo;
    private final EntrenadorRepository entrenadorRepo;

    public EquipoEntrenadorController(EquipoEntrenadorRepository repo,
                                      EquipoRepository equipoRepo,
                                      EntrenadorRepository entrenadorRepo) {
        this.repo = repo;
        this.equipoRepo = equipoRepo;
        this.entrenadorRepo = entrenadorRepo;
    }

    @GetMapping
    public List<EquipoEntrenador> listar() {
        return repo.findAll();
    }

    @PostMapping
    public EquipoEntrenador crear(@RequestBody EquipoEntrenadorDto dto) {
        EquipoEntrenador ee = new EquipoEntrenador();
        EquipoEntrenadorId id = new EquipoEntrenadorId();
        id.setIdEquipo(dto.getIdEquipo());
        id.setIdEntrenador(dto.getIdEntrenador());
        ee.setId(id);
        ee.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        ee.setEntrenador(entrenadorRepo.findById(dto.getIdEntrenador()).orElseThrow());
        return repo.save(ee);
    }

    @DeleteMapping("/{idEquipo}/{idEntrenador}")
    public void borrar(@PathVariable Integer idEquipo, @PathVariable Integer idEntrenador) {
        EquipoEntrenadorId id = new EquipoEntrenadorId();
        id.setIdEquipo(idEquipo);
        id.setIdEntrenador(idEntrenador);
        repo.deleteById(id);
    }
}
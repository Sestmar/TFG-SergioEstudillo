package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/convocatorias")
public class ConvocatoriaController {

    private final ConvocatoriaRepository repo;
    private final EquipoRepository equipoRepo;

    public ConvocatoriaController(ConvocatoriaRepository repo, EquipoRepository equipoRepo) {
        this.repo = repo;
        this.equipoRepo = equipoRepo;
    }

    @GetMapping
    public List<Convocatoria> listar() { return repo.findAll(); }

    @PostMapping
    public Convocatoria crear(@RequestBody ConvocatoriaDto dto) {
        Convocatoria c = new Convocatoria();
        c.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        c.setFechaEvento(Timestamp.valueOf(dto.getFechaEvento())); // Formato: "2025-11-10 19:00:00"
        c.setTipo(dto.getTipo());
        c.setObservaciones(dto.getObservaciones());
        return repo.save(c);
    }
}
package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaDto;
import com.DAMUnitedFC.backend_tfg.model.Convocatoria;
import com.DAMUnitedFC.backend_tfg.repository.ConvocatoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
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
    public List<Convocatoria> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Convocatoria obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Convocatoria no encontrada"));
    }

    @PostMapping
    public Convocatoria crear(@RequestBody ConvocatoriaDto dto) {
        Convocatoria c = new Convocatoria();
        c.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        c.setFechaEvento(Timestamp.valueOf(dto.getFechaEvento()));
        c.setTipo(dto.getTipo());
        c.setObservaciones(dto.getObservaciones());
        return repo.save(c);
    }

    @PutMapping("/{id}")
    public Convocatoria actualizar(@PathVariable Integer id, @RequestBody ConvocatoriaDto dto) {
        Convocatoria c = repo.findById(id).orElseThrow(() -> new RuntimeException("Convocatoria no encontrada"));
        c.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        c.setFechaEvento(Timestamp.valueOf(dto.getFechaEvento()));
        c.setTipo(dto.getTipo());
        c.setObservaciones(dto.getObservaciones());
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
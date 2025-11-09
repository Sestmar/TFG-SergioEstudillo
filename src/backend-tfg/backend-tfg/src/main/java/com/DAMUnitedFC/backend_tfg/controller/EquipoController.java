package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoRepository equipoRepository;

    public EquipoController(EquipoRepository equipoRepository) {
        this.equipoRepository = equipoRepository;
    }

    @GetMapping
    public List<Equipo> getEquipos() {
        return equipoRepository.findAll();
    }

    @PostMapping
    public Equipo crearEquipo(@RequestBody Equipo equipo) {
        return equipoRepository.save(equipo);
    }

    @GetMapping("/{id}")
    public Equipo getEquipo(@PathVariable Integer id) {
        return equipoRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Equipo actualizarEquipo(@PathVariable Integer id, @RequestBody Equipo equipoActualizado) {
        equipoActualizado.setIdEquipo(id);
        return equipoRepository.save(equipoActualizado);
    }

    @DeleteMapping("/{id}")
    public void borrarEquipo(@PathVariable Integer id) {
        equipoRepository.deleteById(id);
    }
}
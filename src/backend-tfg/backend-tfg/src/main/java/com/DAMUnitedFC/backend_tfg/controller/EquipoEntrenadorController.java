package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EquipoEntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.service.EquipoEntrenadorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipo-entrenador")
public class EquipoEntrenadorController {

    private final EquipoEntrenadorService equipoEntrenadorService;

    public EquipoEntrenadorController(EquipoEntrenadorService equipoEntrenadorService) {
        this.equipoEntrenadorService = equipoEntrenadorService;
    }

    @GetMapping
    public List<EquipoEntrenador> listar() {
        return equipoEntrenadorService.listar();
    }

    @PostMapping
    public EquipoEntrenador crear(@RequestBody EquipoEntrenadorDto dto) {
        return equipoEntrenadorService.crear(dto);
    }

    @DeleteMapping("/{idEquipo}/{idEntrenador}")
    public void borrar(@PathVariable Integer idEquipo, @PathVariable Integer idEntrenador) {
        equipoEntrenadorService.borrar(idEquipo, idEntrenador);
    }
}

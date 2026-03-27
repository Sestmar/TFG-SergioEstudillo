package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EquipoDto;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.service.EquipoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public List<Equipo> getEquipos() {
        return equipoService.listar();
    }

    @GetMapping("/{id}")
    public Equipo getEquipo(@PathVariable Integer id) {
        return equipoService.obtener(id);
    }

    @PostMapping
    public Equipo crearEquipo(@RequestBody EquipoDto equipoDto) {
        return equipoService.crear(equipoDto);
    }

    @PutMapping("/{id}")
    public Equipo actualizarEquipo(@PathVariable Integer id, @RequestBody EquipoDto equipoDto) {
        return equipoService.actualizar(id, equipoDto);
    }

    @DeleteMapping("/{id}")
    public void borrarEquipo(@PathVariable Integer id) {
        equipoService.borrar(id);
    }
}

package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.IncidenciaDto;
import com.DAMUnitedFC.backend_tfg.model.Incidencia;
import com.DAMUnitedFC.backend_tfg.service.IncidenciaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @GetMapping
    public List<Incidencia> listar() {
        return incidenciaService.listar();
    }

    @GetMapping("/{id}")
    public Incidencia obtener(@PathVariable Integer id) {
        return incidenciaService.obtener(id);
    }

    @PostMapping
    public Incidencia crear(@RequestBody IncidenciaDto dto) {
        return incidenciaService.crear(dto);
    }

    @PutMapping("/{id}")
    public Incidencia actualizar(@PathVariable Integer id, @RequestBody IncidenciaDto dto) {
        return incidenciaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        incidenciaService.borrar(id);
    }
}
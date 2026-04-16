package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.LigaDto;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.service.LigaService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ligas")
public class LigaController {

    private final LigaService ligaService;

    public LigaController(LigaService ligaService) {
        this.ligaService = ligaService;
    }

    @GetMapping
    public List<Liga> getLigas() {
        return ligaService.listar();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Liga crearLiga(@RequestBody LigaDto ligaDto) {
        return ligaService.crear(ligaDto);
    }

    @GetMapping("/{id}")
    public Liga getLiga(@PathVariable Integer id) {
        return ligaService.obtener(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Liga actualizarLiga(@PathVariable Integer id, @RequestBody Liga ligaActualizada) {
        return ligaService.actualizar(id, ligaActualizada);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void borrarLiga(@PathVariable Integer id) {
        ligaService.borrar(id);
    }
}
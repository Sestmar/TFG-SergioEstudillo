package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.SolicitudInscripcionDto;
import com.DAMUnitedFC.backend_tfg.model.SolicitudInscripcion;
import com.DAMUnitedFC.backend_tfg.service.SolicitudInscripcionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudInscripcionController {

    private final SolicitudInscripcionService solicitudService;

    public SolicitudInscripcionController(SolicitudInscripcionService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<SolicitudInscripcion> listar() {
        return solicitudService.listar();
    }

    @PostMapping
    public SolicitudInscripcion crear(@RequestBody SolicitudInscripcionDto dto) {
        return solicitudService.crear(dto);
    }

    @PutMapping("/{id}")
    public SolicitudInscripcion actualizar(@PathVariable Integer id, @RequestBody SolicitudInscripcionDto dto) {
        return solicitudService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        solicitudService.borrar(id);
    }
}
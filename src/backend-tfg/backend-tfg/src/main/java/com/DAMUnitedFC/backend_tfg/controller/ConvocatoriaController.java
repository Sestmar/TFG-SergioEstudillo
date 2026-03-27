package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaDto;
import com.DAMUnitedFC.backend_tfg.model.Convocatoria;
import com.DAMUnitedFC.backend_tfg.service.ConvocatoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/convocatorias")
public class ConvocatoriaController {

    private final ConvocatoriaService convocatoriaService;

    public ConvocatoriaController(ConvocatoriaService convocatoriaService) {
        this.convocatoriaService = convocatoriaService;
    }

    @GetMapping
    public List<Convocatoria> listar() {
        return convocatoriaService.listar();
    }

    @GetMapping("/{id}")
    public Convocatoria obtener(@PathVariable Integer id) {
        return convocatoriaService.obtener(id);
    }

    @PostMapping
    public Convocatoria crear(@RequestBody ConvocatoriaDto dto) {
        return convocatoriaService.crear(dto);
    }

    @PutMapping("/{id}")
    public Convocatoria actualizar(@PathVariable Integer id, @RequestBody ConvocatoriaDto dto) {
        return convocatoriaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        convocatoriaService.borrar(id);
    }
}
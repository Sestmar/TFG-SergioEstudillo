package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaJugadorDto;
import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugador;
import com.DAMUnitedFC.backend_tfg.service.ConvocatoriaJugadorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/convocatoria-jugador")
public class ConvocatoriaJugadorController {

    private final ConvocatoriaJugadorService convocatoriaJugadorService;

    public ConvocatoriaJugadorController(ConvocatoriaJugadorService convocatoriaJugadorService) {
        this.convocatoriaJugadorService = convocatoriaJugadorService;
    }

    @GetMapping
    public List<ConvocatoriaJugador> listar() {
        return convocatoriaJugadorService.listar();
    }

    @PostMapping
    public ConvocatoriaJugador crear(@RequestBody ConvocatoriaJugadorDto dto) {
        return convocatoriaJugadorService.crear(dto);
    }

    @DeleteMapping("/{idConvocatoria}/{idJugador}")
    public void borrar(@PathVariable Integer idConvocatoria, @PathVariable Integer idJugador) {
        convocatoriaJugadorService.borrar(idConvocatoria, idJugador);
    }
}
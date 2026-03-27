package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.JugadorEquipoDto;
import com.DAMUnitedFC.backend_tfg.model.JugadorEquipo;
import com.DAMUnitedFC.backend_tfg.service.JugadorEquipoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jugador-equipo")
public class JugadorEquipoController {

    private final JugadorEquipoService jugadorEquipoService;

    public JugadorEquipoController(JugadorEquipoService jugadorEquipoService) {
        this.jugadorEquipoService = jugadorEquipoService;
    }

    @GetMapping
    public List<JugadorEquipo> listar() {
        return jugadorEquipoService.listar();
    }

    @PostMapping
    public JugadorEquipo crear(@RequestBody JugadorEquipoDto dto) {
        return jugadorEquipoService.crear(dto);
    }

    @DeleteMapping("/{idJugador}/{idEquipo}")
    public void borrar(@PathVariable Integer idJugador, @PathVariable Integer idEquipo) {
        jugadorEquipoService.borrar(idJugador, idEquipo);
    }
}
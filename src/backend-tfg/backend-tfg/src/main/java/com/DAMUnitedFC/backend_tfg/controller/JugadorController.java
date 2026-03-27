package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.service.JugadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
public class JugadorController {

    private final JugadorService jugadorService;

    public JugadorController(JugadorService jugadorService) {
        this.jugadorService = jugadorService;
    }

    @GetMapping
    public List<Jugador> listar() {
        return jugadorService.listar();
    }

    @GetMapping("/{id}")
    public Jugador obtener(@PathVariable Integer id) {
        return jugadorService.obtener(id);
    }

    @PostMapping
    public Jugador crear(@RequestBody JugadorDto dto) {
        return jugadorService.crear(dto);
    }

    @PutMapping("/{id}")
    public Jugador actualizar(@PathVariable Integer id, @RequestBody JugadorDto dto) {
        return jugadorService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        jugadorService.borrar(id);
    }

    @GetMapping("/{id}/stats")
    public EstadisticasJugadorDto obtenerEstadisticas(@PathVariable Integer id) {
        return jugadorService.obtenerEstadisticas(id);
    }

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelJugador(@PathVariable Integer idUsuario) {
        return jugadorService.getEquipoDelJugador(idUsuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

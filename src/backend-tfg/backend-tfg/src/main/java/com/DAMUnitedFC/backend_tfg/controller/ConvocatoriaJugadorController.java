package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaJugadorDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/convocatoria-jugador")
public class ConvocatoriaJugadorController {

    private final ConvocatoriaJugadorRepository repo;
    private final ConvocatoriaRepository convocatoriaRepo;
    private final JugadorRepository jugadorRepo;

    public ConvocatoriaJugadorController(ConvocatoriaJugadorRepository repo,
                                         ConvocatoriaRepository convocatoriaRepo,
                                         JugadorRepository jugadorRepo) {
        this.repo = repo;
        this.convocatoriaRepo = convocatoriaRepo;
        this.jugadorRepo = jugadorRepo;
    }

    @GetMapping
    public List<ConvocatoriaJugador> listar() {
        return repo.findAll();
    }

    @PostMapping
    public ConvocatoriaJugador crear(@RequestBody ConvocatoriaJugadorDto dto) {
        ConvocatoriaJugador cj = new ConvocatoriaJugador();
        ConvocatoriaJugadorId id = new ConvocatoriaJugadorId();
        id.setIdConvocatoria(dto.getIdConvocatoria());
        id.setIdJugador(dto.getIdJugador());
        cj.setId(id);
        cj.setConvocatoria(convocatoriaRepo.findById(dto.getIdConvocatoria()).orElseThrow());
        cj.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        return repo.save(cj);
    }

    @DeleteMapping("/{idConvocatoria}/{idJugador}")
    public void borrar(@PathVariable Integer idConvocatoria, @PathVariable Integer idJugador) {
        ConvocatoriaJugadorId id = new ConvocatoriaJugadorId();
        id.setIdConvocatoria(idConvocatoria);
        id.setIdJugador(idJugador);
        repo.deleteById(id);
    }
}
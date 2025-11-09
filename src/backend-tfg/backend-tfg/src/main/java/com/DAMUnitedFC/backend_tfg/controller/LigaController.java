package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ligas")
public class LigaController {

    private final LigaRepository ligaRepository;

    public LigaController(LigaRepository ligaRepository) {
        this.ligaRepository = ligaRepository;
    }

    @GetMapping
    public List<Liga> getLigas() {
        return ligaRepository.findAll();
    }

    @PostMapping
    public Liga crearLiga(@RequestBody Liga liga) {
        return ligaRepository.save(liga);
    }

    @GetMapping("/{id}")
    public Liga getLiga(@PathVariable Integer id) {
        return ligaRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Liga actualizarLiga(@PathVariable Integer id, @RequestBody Liga ligaActualizada) {
        ligaActualizada.setIdLiga(id);
        return ligaRepository.save(ligaActualizada);
    }

    @DeleteMapping("/{id}")
    public void borrarLiga(@PathVariable Integer id) {
        ligaRepository.deleteById(id);
    }
}
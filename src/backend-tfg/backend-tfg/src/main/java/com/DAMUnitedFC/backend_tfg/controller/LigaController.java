package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.LigaDto;
import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ligas")
public class LigaController {

    private final LigaRepository ligaRepository;
    private final CategoriaRepository categoriaRepository;

    public LigaController(LigaRepository ligaRepository, CategoriaRepository categoriaRepository) {
        this.ligaRepository = ligaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Liga> getLigas() {
        return ligaRepository.findAll();
    }

    @PostMapping
    public Liga crearLiga(@RequestBody LigaDto ligaDto) {
        Categoria categoria = categoriaRepository.findById(ligaDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        Liga liga = new Liga();
        liga.setNombre(ligaDto.getNombre());
        liga.setTemporada(ligaDto.getTemporada());
        liga.setNivel(ligaDto.getNivel());
        liga.setObservaciones(ligaDto.getObservaciones());
        liga.setCategoria(categoria);
        return ligaRepository.save(liga);
    }

    @GetMapping("/{id}")
    public Liga getLiga(@PathVariable Integer id) {
        return ligaRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Liga actualizarLiga(@PathVariable Integer id, @RequestBody Liga ligaActualizada) {
        ligaActualizada.setIdliga(id);
        return ligaRepository.save(ligaActualizada);
    }

    @DeleteMapping("/{id}")
    public void borrarLiga(@PathVariable Integer id) {
        ligaRepository.deleteById(id);
    }
}
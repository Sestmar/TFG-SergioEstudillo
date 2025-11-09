package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Categoria> getCategorias() {
        return categoriaRepository.findAll();
    }

    @PostMapping
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @GetMapping("/{id}")
    public Categoria getCategoria(@PathVariable Integer id) {
        return categoriaRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Categoria actualizarCategoria(@PathVariable Integer id, @RequestBody Categoria categoriaActualizada) {
        categoriaActualizada.setIdCategoria(id);
        return categoriaRepository.save(categoriaActualizada);
    }

    @DeleteMapping("/{id}")
    public void borrarCategoria(@PathVariable Integer id) {
        categoriaRepository.deleteById(id);
    }
}
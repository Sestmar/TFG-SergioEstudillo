package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.service.CategoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<Categoria> getCategorias() {
        return categoriaService.listar();
    }

    @PostMapping
    public Categoria crearCategoria(@RequestBody Categoria categoria) {
        return categoriaService.crear(categoria);
    }

    @GetMapping("/{id}")
    public Categoria getCategoria(@PathVariable Integer id) {
        return categoriaService.obtener(id);
    }

    @PutMapping("/{id}")
    public Categoria actualizarCategoria(@PathVariable Integer id, @RequestBody Categoria categoriaActualizada) {
        return categoriaService.actualizar(id, categoriaActualizada);
    }

    @DeleteMapping("/{id}")
    public void borrarCategoria(@PathVariable Integer id) {
        categoriaService.borrar(id);
    }
}
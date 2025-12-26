package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EquipoDto;
import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "*") // Asegúrate de tener esto para evitar problemas de CORS
public class EquipoController {

    private final EquipoRepository equipoRepository;
    private final LigaRepository ligaRepository;
    private final CategoriaRepository categoriaRepository;

    public EquipoController(EquipoRepository equipoRepository, LigaRepository ligaRepository, CategoriaRepository categoriaRepository) {
        this.equipoRepository = equipoRepository;
        this.ligaRepository = ligaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Equipo> getEquipos() {
        return equipoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Equipo getEquipo(@PathVariable Integer id) {
        return equipoRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Equipo crearEquipo(@RequestBody EquipoDto equipoDto) {
        Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
                .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
        Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Equipo equipo = new Equipo();
        equipo.setNombre(equipoDto.getNombre());
        // Importante: parsear fecha. Si viene como String "yyyy-MM-dd" funciona con Date.valueOf
        equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
        equipo.setObservaciones(equipoDto.getObservaciones());

        // ✅ NUEVO: Guardar el escudo
        equipo.setEscudoUrl(equipoDto.getEscudoUrl());

        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        return equipoRepository.save(equipo);
    }

    @PutMapping("/{id}")
    public Equipo actualizarEquipo(@PathVariable Integer id, @RequestBody EquipoDto equipoDto) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
                .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
        Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        equipo.setNombre(equipoDto.getNombre());

        if (equipoDto.getFechaCreacion() != null) {
            equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
        }

        equipo.setObservaciones(equipoDto.getObservaciones());

        // ✅ NUEVO: Actualizar el escudo
        if (equipoDto.getEscudoUrl() != null) {
            equipo.setEscudoUrl(equipoDto.getEscudoUrl());
        }

        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        return equipoRepository.save(equipo);
    }

    @DeleteMapping("/{id}")
    public void borrarEquipo(@PathVariable Integer id) {
        equipoRepository.deleteById(id);
    }
}
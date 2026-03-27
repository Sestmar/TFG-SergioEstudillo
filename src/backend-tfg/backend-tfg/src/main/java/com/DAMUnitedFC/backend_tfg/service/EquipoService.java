package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EquipoDto;
import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final LigaRepository ligaRepository;
    private final CategoriaRepository categoriaRepository;

    public EquipoService(EquipoRepository equipoRepository, LigaRepository ligaRepository, CategoriaRepository categoriaRepository) {
        this.equipoRepository = equipoRepository;
        this.ligaRepository = ligaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Equipo> listar() {
        return equipoRepository.findAll();
    }

    public Equipo obtener(Integer id) {
        return equipoRepository.findById(id).orElse(null);
    }

    public Equipo crear(EquipoDto equipoDto) {
        Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
                .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
        Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Equipo equipo = new Equipo();
        equipo.setNombre(equipoDto.getNombre());
        equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
        equipo.setObservaciones(equipoDto.getObservaciones());
        equipo.setEscudoUrl(equipoDto.getEscudoUrl());
        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        return equipoRepository.save(equipo);
    }

    public Equipo actualizar(Integer id, EquipoDto equipoDto) {
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
        if (equipoDto.getEscudoUrl() != null) {
            equipo.setEscudoUrl(equipoDto.getEscudoUrl());
        }
        equipo.setLiga(liga);
        equipo.setCategoria(categoria);
        return equipoRepository.save(equipo);
    }

    public void borrar(Integer id) {
        equipoRepository.deleteById(id);
    }
}

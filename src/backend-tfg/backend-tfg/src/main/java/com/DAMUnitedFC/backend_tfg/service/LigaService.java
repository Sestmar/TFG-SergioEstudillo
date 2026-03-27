package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.LigaDto;
import com.DAMUnitedFC.backend_tfg.model.Categoria;
import com.DAMUnitedFC.backend_tfg.model.Liga;
import com.DAMUnitedFC.backend_tfg.repository.CategoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.LigaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LigaService {

    private final LigaRepository ligaRepository;
    private final CategoriaRepository categoriaRepository;

    public LigaService(LigaRepository ligaRepository, CategoriaRepository categoriaRepository) {
        this.ligaRepository = ligaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Liga> listar() {
        return ligaRepository.findAll();
    }

    public Liga obtener(Integer id) {
        return ligaRepository.findById(id).orElse(null);
    }

    public Liga crear(LigaDto ligaDto) {
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

    public Liga actualizar(Integer id, Liga ligaActualizada) {
        ligaActualizada.setIdliga(id);
        return ligaRepository.save(ligaActualizada);
    }

    public void borrar(Integer id) {
        ligaRepository.deleteById(id);
    }
}

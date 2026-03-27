package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaDto;
import com.DAMUnitedFC.backend_tfg.model.Convocatoria;
import com.DAMUnitedFC.backend_tfg.repository.ConvocatoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ConvocatoriaService {

    private final ConvocatoriaRepository convocatoriaRepository;
    private final EquipoRepository equipoRepository;

    public ConvocatoriaService(ConvocatoriaRepository convocatoriaRepository, EquipoRepository equipoRepository) {
        this.convocatoriaRepository = convocatoriaRepository;
        this.equipoRepository = equipoRepository;
    }

    public List<Convocatoria> listar() {
        return convocatoriaRepository.findAll();
    }

    public Convocatoria obtener(Integer id) {
        return convocatoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convocatoria no encontrada"));
    }

    public Convocatoria crear(ConvocatoriaDto dto) {
        Convocatoria c = new Convocatoria();
        c.setEquipo(equipoRepository.findById(dto.getIdEquipo()).orElseThrow());
        c.setFechaEvento(Timestamp.valueOf(dto.getFechaEvento()));
        c.setTipo(dto.getTipo());
        c.setObservaciones(dto.getObservaciones());
        return convocatoriaRepository.save(c);
    }

    public Convocatoria actualizar(Integer id, ConvocatoriaDto dto) {
        Convocatoria c = convocatoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Convocatoria no encontrada"));
        c.setEquipo(equipoRepository.findById(dto.getIdEquipo()).orElseThrow());
        c.setFechaEvento(Timestamp.valueOf(dto.getFechaEvento()));
        c.setTipo(dto.getTipo());
        c.setObservaciones(dto.getObservaciones());
        return convocatoriaRepository.save(c);
    }

    public void borrar(Integer id) {
        convocatoriaRepository.deleteById(id);
    }
}

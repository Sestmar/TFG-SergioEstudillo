package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.ConvocatoriaJugadorDto;
import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugador;
import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugadorId;
import com.DAMUnitedFC.backend_tfg.repository.ConvocatoriaJugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.ConvocatoriaRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConvocatoriaJugadorService {

    private final ConvocatoriaJugadorRepository repo;
    private final ConvocatoriaRepository convocatoriaRepo;
    private final JugadorRepository jugadorRepo;

    public ConvocatoriaJugadorService(ConvocatoriaJugadorRepository repo,
                                      ConvocatoriaRepository convocatoriaRepo,
                                      JugadorRepository jugadorRepo) {
        this.repo = repo;
        this.convocatoriaRepo = convocatoriaRepo;
        this.jugadorRepo = jugadorRepo;
    }

    public List<ConvocatoriaJugador> listar() {
        return repo.findAll();
    }

    public ConvocatoriaJugador crear(ConvocatoriaJugadorDto dto) {
        ConvocatoriaJugadorId id = new ConvocatoriaJugadorId();
        id.setIdConvocatoria(dto.getIdConvocatoria());
        id.setIdJugador(dto.getIdJugador());

        ConvocatoriaJugador cj = new ConvocatoriaJugador();
        cj.setId(id);
        cj.setConvocatoria(convocatoriaRepo.findById(dto.getIdConvocatoria()).orElseThrow());
        cj.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        return repo.save(cj);
    }

    public void borrar(Integer idConvocatoria, Integer idJugador) {
        ConvocatoriaJugadorId id = new ConvocatoriaJugadorId();
        id.setIdConvocatoria(idConvocatoria);
        id.setIdJugador(idJugador);
        repo.deleteById(id);
    }
}

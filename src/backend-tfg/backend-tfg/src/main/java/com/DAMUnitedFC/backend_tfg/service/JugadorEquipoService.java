package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.JugadorEquipoDto;
import com.DAMUnitedFC.backend_tfg.model.JugadorEquipo;
import com.DAMUnitedFC.backend_tfg.model.JugadorEquipoId;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorEquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JugadorEquipoService {

    private final JugadorEquipoRepository repo;
    private final JugadorRepository jugadorRepo;
    private final EquipoRepository equipoRepo;

    public JugadorEquipoService(JugadorEquipoRepository repo, JugadorRepository jugadorRepo, EquipoRepository equipoRepo) {
        this.repo = repo;
        this.jugadorRepo = jugadorRepo;
        this.equipoRepo = equipoRepo;
    }

    public List<JugadorEquipo> listar() {
        return repo.findAll();
    }

    public JugadorEquipo crear(JugadorEquipoDto dto) {
        JugadorEquipoId id = new JugadorEquipoId();
        id.setIdJugador(dto.getIdJugador());
        id.setIdEquipo(dto.getIdEquipo());

        JugadorEquipo je = new JugadorEquipo();
        je.setId(id);
        je.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        je.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        je.setObservacion(dto.getObservacion());
        return repo.save(je);
    }

    public void borrar(Integer idJugador, Integer idEquipo) {
        JugadorEquipoId id = new JugadorEquipoId();
        id.setIdJugador(idJugador);
        id.setIdEquipo(idEquipo);
        repo.deleteById(id);
    }
}

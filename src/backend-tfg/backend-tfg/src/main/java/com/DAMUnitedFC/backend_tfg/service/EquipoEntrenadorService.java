package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EquipoEntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenadorId;
import com.DAMUnitedFC.backend_tfg.repository.EntrenadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoEntrenadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipoEntrenadorService {

    private final EquipoEntrenadorRepository repo;
    private final EquipoRepository equipoRepo;
    private final EntrenadorRepository entrenadorRepo;

    public EquipoEntrenadorService(EquipoEntrenadorRepository repo,
                                   EquipoRepository equipoRepo,
                                   EntrenadorRepository entrenadorRepo) {
        this.repo = repo;
        this.equipoRepo = equipoRepo;
        this.entrenadorRepo = entrenadorRepo;
    }

    public List<EquipoEntrenador> listar() {
        return repo.findAll();
    }

    public EquipoEntrenador crear(EquipoEntrenadorDto dto) {
        EquipoEntrenadorId id = new EquipoEntrenadorId();
        id.setIdEquipo(dto.getIdEquipo());
        id.setIdEntrenador(dto.getIdEntrenador());

        EquipoEntrenador ee = new EquipoEntrenador();
        ee.setId(id);
        ee.setEquipo(equipoRepo.findById(dto.getIdEquipo()).orElseThrow());
        ee.setEntrenador(entrenadorRepo.findById(dto.getIdEntrenador()).orElseThrow());
        ee.setRol(dto.getRol());
        return repo.save(ee);
    }

    public void borrar(Integer idEquipo, Integer idEntrenador) {
        EquipoEntrenadorId id = new EquipoEntrenadorId();
        id.setIdEquipo(idEquipo);
        id.setIdEntrenador(idEntrenador);
        repo.deleteById(id);
    }
}

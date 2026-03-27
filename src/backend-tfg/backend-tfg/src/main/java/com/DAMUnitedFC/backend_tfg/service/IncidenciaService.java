package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.IncidenciaDto;
import com.DAMUnitedFC.backend_tfg.model.Incidencia;
import com.DAMUnitedFC.backend_tfg.repository.IncidenciaRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class IncidenciaService {

    private final IncidenciaRepository repo;
    private final JugadorRepository jugadorRepo;
    private final UsuarioRepository usuarioRepo;

    public IncidenciaService(IncidenciaRepository repo, JugadorRepository jugadorRepo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.jugadorRepo = jugadorRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public List<Incidencia> listar() {
        return repo.findAll();
    }

    public Incidencia obtener(Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
    }

    public Incidencia crear(IncidenciaDto dto) {
        Incidencia i = new Incidencia();
        return mapearYGuardar(i, dto);
    }

    public Incidencia actualizar(Integer id, IncidenciaDto dto) {
        Incidencia i = repo.findById(id).orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
        return mapearYGuardar(i, dto);
    }

    public void borrar(Integer id) {
        repo.deleteById(id);
    }

    private Incidencia mapearYGuardar(Incidencia i, IncidenciaDto dto) {
        i.setJugador(dto.getIdJugador() != null ? jugadorRepo.findById(dto.getIdJugador()).orElse(null) : null);
        i.setUsuario(dto.getIdUsuario() != null ? usuarioRepo.findById(dto.getIdUsuario()).orElse(null) : null);
        i.setFechaReporte(Date.valueOf(dto.getFechaReporte()));
        i.setTipo(dto.getTipo());
        i.setEstado(dto.getEstado());
        i.setDescripcion(dto.getDescripcion());
        return repo.save(i);
    }
}

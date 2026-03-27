package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.SolicitudInscripcionDto;
import com.DAMUnitedFC.backend_tfg.model.SolicitudInscripcion;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.SolicitudInscripcionRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class SolicitudInscripcionService {

    private final SolicitudInscripcionRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final JugadorRepository jugadorRepo;

    public SolicitudInscripcionService(SolicitudInscripcionRepository repo,
                                       UsuarioRepository usuarioRepo,
                                       JugadorRepository jugadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.jugadorRepo = jugadorRepo;
    }

    public List<SolicitudInscripcion> listar() {
        return repo.findAll();
    }

    public SolicitudInscripcion crear(SolicitudInscripcionDto dto) {
        SolicitudInscripcion s = new SolicitudInscripcion();
        s.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        s.setEstado("pendiente");
        s.setFechaSolicitud(new Date(System.currentTimeMillis()));
        s.setMotivoRechazo(null);
        s.setJugador(null);
        return repo.save(s);
    }

    public SolicitudInscripcion actualizar(Integer id, SolicitudInscripcionDto dto) {
        SolicitudInscripcion s = repo.findById(id).orElseThrow();
        s.setEstado(dto.getEstado());
        s.setMotivoRechazo(dto.getMotivoRechazo());
        if ("aceptada".equals(dto.getEstado()) && dto.getIdJugador() != null) {
            s.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        }
        return repo.save(s);
    }

    public void borrar(Integer id) {
        repo.deleteById(id);
    }
}

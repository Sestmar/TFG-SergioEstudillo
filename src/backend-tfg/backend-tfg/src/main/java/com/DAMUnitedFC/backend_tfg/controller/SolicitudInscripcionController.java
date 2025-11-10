package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.SolicitudInscripcionDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudInscripcionController {

    private final SolicitudInscripcionRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final JugadorRepository jugadorRepo;

    public SolicitudInscripcionController(SolicitudInscripcionRepository repo,
                                          UsuarioRepository usuarioRepo,
                                          JugadorRepository jugadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.jugadorRepo = jugadorRepo;
    }

    @GetMapping
    public List<SolicitudInscripcion> listar() {
        return repo.findAll();
    }

    @PostMapping
    public SolicitudInscripcion crear(@RequestBody SolicitudInscripcionDto dto) {
        SolicitudInscripcion s = new SolicitudInscripcion();
        // Si el id es Integer, no hay conversión necesaria
        s.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        s.setEstado("pendiente");
        s.setFechaSolicitud(new Date(System.currentTimeMillis()));
        s.setMotivoRechazo(null);
        s.setJugador(null); // Sólo se asigna si se acepta la solicitud
        return repo.save(s);
    }

    @PutMapping("/{id}")
    public SolicitudInscripcion actualizar(@PathVariable Integer id, @RequestBody SolicitudInscripcionDto dto) {
        SolicitudInscripcion s = repo.findById(id).orElseThrow();
        s.setEstado(dto.getEstado());
        s.setMotivoRechazo(dto.getMotivoRechazo());
        if ("aceptada".equals(dto.getEstado()) && dto.getIdJugador() != null) {
            s.setJugador(jugadorRepo.findById(dto.getIdJugador()).orElseThrow());
        }
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
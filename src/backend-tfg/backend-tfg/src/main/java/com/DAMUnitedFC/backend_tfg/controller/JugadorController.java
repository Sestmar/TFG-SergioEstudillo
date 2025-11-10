package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.web.bind.annotation.*;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
public class JugadorController {

    private final JugadorRepository repo;
    private final UsuarioRepository usuarioRepo;

    public JugadorController(JugadorRepository repo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping
    public List<Jugador> listar() { return repo.findAll(); }

    @PostMapping
    public Jugador crear(@RequestBody JugadorDto dto) {
        Jugador j = new Jugador();
        j.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow());
        j.setFechaNacimiento(Date.valueOf(dto.getFechaNacimiento()));
        j.setPosicion(dto.getPosicion());
        j.setDorsal(dto.getDorsal());
        j.setEstado(dto.getEstado());
        j.setTelefonoContacto(dto.getTelefonoContacto());
        j.setDireccion(dto.getDireccion());
        j.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        j.setFechaBaja(dto.getFechaBaja() != null ? Date.valueOf(dto.getFechaBaja()) : null);
        j.setObservaciones(dto.getObservaciones());
        j.setEquipoPrincipal(dto.getEquipoPrincipal());
        return repo.save(j);
    }

    // Añade métodos PUT y DELETE siguiendo este patrón
}
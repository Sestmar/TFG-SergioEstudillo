package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Equipo; // ✅ Importar Equipo
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository; // ✅ Importar Repo Equipo
import org.springframework.web.bind.annotation.*;
import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import java.sql.Date;
import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
public class JugadorController {

    private final JugadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo; // ✅ Nuevo

    // ✅ Inyectamos el repo de equipos
    public JugadorController(JugadorRepository repo, UsuarioRepository usuarioRepo, EquipoRepository equipoRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
    }

    @GetMapping
    public List<Jugador> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Jugador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

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

        // 🔥 LÓGICA DE EQUIPO: Buscamos el objeto por el ID
        if (dto.getEquipoPrincipal() != null) {
            Equipo e = equipoRepo.findById(dto.getEquipoPrincipal()).orElse(null);
            j.setEquipoPrincipal(e);
        } else {
            j.setEquipoPrincipal(null);
        }

        return repo.save(j);
    }

    @PutMapping("/{id}")
    public Jugador actualizar(@PathVariable Integer id, @RequestBody JugadorDto dto) {
        Jugador j = repo.findById(id).orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

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

        // 🔥 LÓGICA DE EQUIPO: Actualización
        if (dto.getEquipoPrincipal() != null) {
            Equipo e = equipoRepo.findById(dto.getEquipoPrincipal()).orElse(null);
            j.setEquipoPrincipal(e);
        } else {
            j.setEquipoPrincipal(null);
        }

        return repo.save(j);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    @GetMapping("/{id}/stats")
    public EstadisticasJugadorDto obtenerEstadisticas(@PathVariable Integer id) {
        return new EstadisticasJugadorDto(0, 0, 0, 0);
    }
}
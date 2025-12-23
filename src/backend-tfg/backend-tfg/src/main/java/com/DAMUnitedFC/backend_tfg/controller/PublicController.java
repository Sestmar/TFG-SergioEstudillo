package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.PublicPlayerDto;
import com.DAMUnitedFC.backend_tfg.dto.PublicTeamDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*") // Permitimos acceso desde cualquier lugar
public class PublicController {

    @Autowired private EquipoRepository equipoRepo;
    @Autowired private JugadorRepository jugadorRepo;
    @Autowired private AlineacionRepository alineacionRepo;

    // 1. Obtener lista de todos los equipos del club
    @GetMapping("/equipos")
    public ResponseEntity<List<PublicTeamDto>> getAllPublicTeams() {
        List<Equipo> equipos = equipoRepo.findAll();

        List<PublicTeamDto> dtos = equipos.stream().map(e -> {
            PublicTeamDto dto = new PublicTeamDto();

            // 🔥 CORRECCIÓN 1: Convertir Integer a Long explícitamente
            dto.setIdEquipo(Long.valueOf(e.getIdEquipo()));

            dto.setNombre(e.getNombre());
            dto.setFotoUrl(e.getFotoUrl());
            if (e.getCategoria() != null) {
                dto.setCategoria(e.getCategoria().getNombre());
            }
            dto.setEntrenadorNombre("Staff Técnico");
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 2. Obtener la Plantilla (Roster) de un equipo específico
    @GetMapping("/equipos/{idEquipo}/plantilla")
    public ResponseEntity<List<PublicPlayerDto>> getPublicRoster(@PathVariable Long idEquipo) {
        // Buscamos jugadores que pertenezcan a ese equipo
        List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(idEquipo);

        List<PublicPlayerDto> roster = jugadores.stream().map(j -> {
            PublicPlayerDto dto = new PublicPlayerDto();

            // 🔥 CORRECCIÓN 2: Convertir Integer a Long explícitamente
            dto.setIdJugador(Long.valueOf(j.getIdJugador()));

            // Datos seguros del Usuario asociado
            if (j.getUsuario() != null) {
                dto.setNombre(j.getUsuario().getNombre());
                dto.setApellidos(j.getUsuario().getApellidos());
                dto.setNombreCompleto(j.getUsuario().getNombre() + " " + j.getUsuario().getApellidos());
                dto.setFotoUrl(j.getUsuario().getFotoUrl());
            }

            dto.setPosicion(j.getPosicion());
            dto.setDorsal(j.getDorsal());

            // ⚡ CÁLCULO DE ESTADÍSTICAS AL VUELO ⚡
            // Buscamos todas las alineaciones de este jugador
            // Ahora esto funcionará porque añadiste findByJugador en el repositorio
            List<Alineacion> participaciones = alineacionRepo.findByJugador(j);

            int totalGoles = participaciones.stream().mapToInt(a -> a.getGoles() != null ? a.getGoles() : 0).sum();
            int totalAsist = participaciones.stream().mapToInt(a -> a.getAsistencias() != null ? a.getAsistencias() : 0).sum();

            dto.setGoles(totalGoles);
            dto.setAsistencias(totalAsist);

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(roster);
    }
}
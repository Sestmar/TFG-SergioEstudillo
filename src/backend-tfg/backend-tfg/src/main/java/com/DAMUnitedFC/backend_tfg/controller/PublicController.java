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
@CrossOrigin(origins = "*")
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

            // Convierte Integer a Long de forma segura
            dto.setIdEquipo(e.getIdEquipo() != null ? e.getIdEquipo().longValue() : null);

            dto.setNombre(e.getNombre());
            dto.setFotoUrl(e.getFotoUrl()); // Asegúrate de que esto mapea a tu nuevo campo escudo_url si es necesario, o fotoUrl si usas ese.

            if (e.getCategoria() != null) {
                dto.setCategoria(e.getCategoria().getNombre());
            }

            // 🔥 CORRECCIÓN: Obtener nombre real del entrenador
            // Accedemos a Equipo -> Entrenador -> Usuario -> Nombre/Apellidos
            if (e.getEntrenador() != null && e.getEntrenador().getUsuario() != null) {
                String nombreCompleto = e.getEntrenador().getUsuario().getNombre() + " " +
                        e.getEntrenador().getUsuario().getApellidos();
                dto.setEntrenadorNombre(nombreCompleto);
            } else {
                dto.setEntrenadorNombre("Sin Asignar");
            }

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 2. Obtener la Plantilla (Roster) de un equipo específico
    @GetMapping("/equipos/{idEquipo}/plantilla")
    public ResponseEntity<List<PublicPlayerDto>> getPublicRoster(@PathVariable Long idEquipo) {

        // Casteamos Long a Integer porque el repositorio usa Integer
        List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(idEquipo.intValue());

        List<PublicPlayerDto> roster = jugadores.stream().map(j -> {
            PublicPlayerDto dto = new PublicPlayerDto();

            // Convertir Integer a Long
            dto.setIdJugador(j.getIdJugador() != null ? j.getIdJugador().longValue() : null);

            if (j.getUsuario() != null) {
                dto.setNombre(j.getUsuario().getNombre());
                dto.setApellidos(j.getUsuario().getApellidos());
                dto.setNombreCompleto(j.getUsuario().getNombre() + " " + j.getUsuario().getApellidos());
                dto.setFotoUrl(j.getUsuario().getFotoUrl());
            }

            dto.setPosicion(j.getPosicion());
            dto.setDorsal(j.getDorsal());

            // CÁLCULO DE ESTADÍSTICAS
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
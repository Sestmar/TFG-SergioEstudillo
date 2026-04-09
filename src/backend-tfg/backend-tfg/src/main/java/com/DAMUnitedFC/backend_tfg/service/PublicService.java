package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.PublicPlayerDto;
import com.DAMUnitedFC.backend_tfg.dto.PublicTeamDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.exception.ResourceNotFoundException;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicService {

    private final EquipoRepository equipoRepo;
    private final JugadorRepository jugadorRepo;
    private final AlineacionRepository alineacionRepo;

    public PublicService(EquipoRepository equipoRepo,
                         JugadorRepository jugadorRepo,
                         AlineacionRepository alineacionRepo) {
        this.equipoRepo = equipoRepo;
        this.jugadorRepo = jugadorRepo;
        this.alineacionRepo = alineacionRepo;
    }

    public PublicPlayerDto getPublicPlayerById(Long idJugador) {
        Jugador j = jugadorRepo.findById(idJugador.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Jugador", "id", idJugador));

        PublicPlayerDto dto = new PublicPlayerDto();
        dto.setIdJugador(j.getIdJugador() != null ? j.getIdJugador().longValue() : null);
        if (j.getUsuario() != null) {
            dto.setNombre(j.getUsuario().getNombre());
            dto.setApellidos(j.getUsuario().getApellidos());
            dto.setNombreCompleto(j.getUsuario().getNombre() + " " + j.getUsuario().getApellidos());
            dto.setFotoUrl(j.getUsuario().getFotoUrl());
        }
        dto.setPosicion(j.getPosicion());
        dto.setDorsal(j.getDorsal());
        List<Alineacion> participaciones = alineacionRepo.findByJugador(j);
        dto.setGoles(participaciones.stream().mapToInt(a -> a.getGoles() != null ? a.getGoles() : 0).sum());
        dto.setAsistencias(participaciones.stream().mapToInt(a -> a.getAsistencias() != null ? a.getAsistencias() : 0).sum());
        dto.setEstado(j.getEstado());
        return dto;
    }

    public List<PublicTeamDto> getAllPublicTeams() {
        return equipoRepo.findAll().stream().map(e -> {
            PublicTeamDto dto = new PublicTeamDto();
            dto.setIdEquipo(e.getIdEquipo() != null ? e.getIdEquipo().longValue() : null);
            dto.setNombre(e.getNombre());
            dto.setFotoUrl(e.getFotoUrl());
            if (e.getCategoria() != null) dto.setCategoria(e.getCategoria().getNombre());
            if (e.getEntrenador() != null && e.getEntrenador().getUsuario() != null) {
                dto.setEntrenadorNombre(e.getEntrenador().getUsuario().getNombre() + " " +
                        e.getEntrenador().getUsuario().getApellidos());
            } else {
                dto.setEntrenadorNombre("Sin Asignar");
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<PublicPlayerDto> getPublicRoster(Long idEquipo) {
        return jugadorRepo.findByEquipoPrincipal_IdEquipo(idEquipo.intValue()).stream().map(j -> {
            PublicPlayerDto dto = new PublicPlayerDto();
            dto.setIdJugador(j.getIdJugador() != null ? j.getIdJugador().longValue() : null);
            if (j.getUsuario() != null) {
                dto.setNombre(j.getUsuario().getNombre());
                dto.setApellidos(j.getUsuario().getApellidos());
                dto.setNombreCompleto(j.getUsuario().getNombre() + " " + j.getUsuario().getApellidos());
                dto.setFotoUrl(j.getUsuario().getFotoUrl());
            }
            dto.setPosicion(j.getPosicion());
            dto.setDorsal(j.getDorsal());

            List<Alineacion> participaciones = alineacionRepo.findByJugador(j);
            dto.setGoles(participaciones.stream().mapToInt(a -> a.getGoles() != null ? a.getGoles() : 0).sum());
            dto.setAsistencias(participaciones.stream().mapToInt(a -> a.getAsistencias() != null ? a.getAsistencias() : 0).sum());
            dto.setEstado(j.getEstado());
            return dto;
        }).collect(Collectors.toList());
    }
}

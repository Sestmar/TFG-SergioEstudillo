package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Service
public class JugadorService {

    private final JugadorRepository jugadorRepo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final AlineacionRepository alineacionRepo;

    public JugadorService(JugadorRepository jugadorRepo,
                          UsuarioRepository usuarioRepo,
                          EquipoRepository equipoRepo,
                          AlineacionRepository alineacionRepo) {
        this.jugadorRepo = jugadorRepo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.alineacionRepo = alineacionRepo;
    }

    public List<Jugador> listar() {
        return jugadorRepo.findAll();
    }

    public Jugador obtener(Integer id) {
        return jugadorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

    public Jugador crear(JugadorDto dto) {
        return guardarOActualizar(new Jugador(), dto);
    }

    public Jugador actualizar(Integer id, JugadorDto dto) {
        Jugador j = jugadorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
        return guardarOActualizar(j, dto);
    }

    public void borrar(Integer id) {
        jugadorRepo.deleteById(id);
    }

    public EstadisticasJugadorDto obtenerEstadisticas(Integer id) {
        Integer partidos = alineacionRepo.countPartidosJugados(id);
        Integer goles = alineacionRepo.sumGoles(id);
        Integer asistencias = alineacionRepo.sumAsistencias(id);
        Integer minutos = alineacionRepo.sumMinutos(id);

        return new EstadisticasJugadorDto(
                partidos != null ? partidos : 0,
                goles != null ? goles : 0,
                asistencias != null ? asistencias : 0,
                minutos != null ? minutos : 0
        );
    }

    public Optional<Equipo> getEquipoDelJugador(Integer idUsuario) {
        return jugadorRepo.findByUsuario_IdUsuario(idUsuario)
                .map(Jugador::getEquipoPrincipal);
    }

    private Jugador guardarOActualizar(Jugador j, JugadorDto dto) {
        if (dto.getIdUsuario() != null) {
            j.setUsuario(usuarioRepo.findById(dto.getIdUsuario().intValue())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }

        j.setFechaNacimiento(dto.getFechaNacimiento() != null ? Date.valueOf(dto.getFechaNacimiento()) : null);
        j.setFechaAlta(dto.getFechaAlta() != null ? Date.valueOf(dto.getFechaAlta()) : null);
        j.setFechaBaja(dto.getFechaBaja() != null ? Date.valueOf(dto.getFechaBaja()) : null);
        j.setPosicion(dto.getPosicion());
        j.setDorsal(dto.getDorsal());
        j.setEstado(dto.getEstado());
        j.setTelefonoContacto(dto.getTelefonoContacto());
        j.setDireccion(dto.getDireccion());
        j.setObservaciones(dto.getObservaciones());

        if (dto.getEquipoPrincipal() != null) {
            j.setEquipoPrincipal(equipoRepo.findById(dto.getEquipoPrincipal().intValue()).orElse(null));
        } else {
            j.setEquipoPrincipal(null);
        }

        return jugadorRepo.save(j);
    }
}

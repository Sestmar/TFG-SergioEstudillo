package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.PublicPlayerDto;
import com.DAMUnitedFC.backend_tfg.exception.ResourceNotFoundException;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios del PublicService.
 * No levanta contexto de Spring — usa Mockito puro (rápido y aislado).
 *
 * Cobertura:
 *  - Cálculo correcto de goles y asistencias acumulados
 *  - Tolerancia a null en campos de Alineacion
 *  - Comportamiento con lista de participaciones vacía
 *  - Comportamiento con equipo sin jugadores
 *  - Lanzamiento de ResourceNotFoundException al buscar jugador inexistente
 */
@ExtendWith(MockitoExtension.class)
class PublicServiceTest {

    @Mock private EquipoRepository equipoRepo;
    @Mock private JugadorRepository jugadorRepo;
    @Mock private AlineacionRepository alineacionRepo;

    @InjectMocks
    private PublicService publicService;

    // ─── helpers ─────────────────────────────────────────────────────────────

    private Jugador crearJugador(int id, String nombre, String apellidos, String posicion) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);

        Jugador j = new Jugador();
        j.setIdJugador(id);
        j.setUsuario(usuario);
        j.setPosicion(posicion);
        j.setDorsal(id);
        j.setEstado("ACTIVO");
        return j;
    }

    private Alineacion crearAlineacion(Jugador j, Integer goles, Integer asistencias) {
        Alineacion a = new Alineacion();
        a.setJugador(j);
        a.setGoles(goles);
        a.setAsistencias(asistencias);
        return a;
    }

    // ─── tests ───────────────────────────────────────────────────────────────

    /**
     * Happy path: jugador con tres participaciones.
     * Verifica que goles y asistencias se acumulan correctamente.
     */
    @Test
    void deberiaCalcularEstadisticasCorrectamenteCuandoJugadorTieneParticipaciones() {
        // Arrange
        Jugador jugador = crearJugador(1, "Carlos", "Pérez", "Delantero");
        when(jugadorRepo.findByEquipoPrincipal_IdEquipo(1))
                .thenReturn(List.of(jugador));
        when(alineacionRepo.findByJugador(jugador))
                .thenReturn(List.of(
                        crearAlineacion(jugador, 2, 1),
                        crearAlineacion(jugador, 1, 0),
                        crearAlineacion(jugador, 0, 2)
                ));

        // Act
        List<PublicPlayerDto> roster = publicService.getPublicRoster(1L);

        // Assert
        assertThat(roster).hasSize(1);
        PublicPlayerDto dto = roster.get(0);
        assertThat(dto.getGoles()).isEqualTo(3);
        assertThat(dto.getAsistencias()).isEqualTo(3);
        assertThat(dto.getNombreCompleto()).isEqualTo("Carlos Pérez");
        assertThat(dto.getPosicion()).isEqualTo("Delantero");
        assertThat(dto.getEstado()).isEqualTo("ACTIVO");
    }

    /**
     * Edge case: los campos goles/asistencias de Alineacion son null.
     * El servicio debe tratarlos como 0 y no lanzar NullPointerException.
     */
    @Test
    void deberiaRetornarCeroEstadisticasCuandoCamposAlineacionSonNulos() {
        // Arrange
        Jugador jugador = crearJugador(2, "Ana", "López", "Portero");
        when(jugadorRepo.findByEquipoPrincipal_IdEquipo(1))
                .thenReturn(List.of(jugador));
        when(alineacionRepo.findByJugador(jugador))
                .thenReturn(List.of(crearAlineacion(jugador, null, null)));

        // Act
        List<PublicPlayerDto> roster = publicService.getPublicRoster(1L);

        // Assert
        assertThat(roster.get(0).getGoles()).isZero();
        assertThat(roster.get(0).getAsistencias()).isZero();
    }

    /**
     * Edge case: jugador registrado en el equipo pero sin ningún partido jugado.
     * La lista de participaciones estará vacía — estadísticas deben ser 0.
     */
    @Test
    void deberiaRetornarCeroEstadisticasCuandoJugadorNoTieneParticipaciones() {
        // Arrange
        Jugador jugador = crearJugador(3, "Pedro", "García", "Defensa");
        when(jugadorRepo.findByEquipoPrincipal_IdEquipo(1))
                .thenReturn(List.of(jugador));
        when(alineacionRepo.findByJugador(jugador))
                .thenReturn(Collections.emptyList());

        // Act
        List<PublicPlayerDto> roster = publicService.getPublicRoster(1L);

        // Assert
        assertThat(roster.get(0).getGoles()).isZero();
        assertThat(roster.get(0).getAsistencias()).isZero();
    }

    /**
     * Edge case: equipo sin jugadores asignados.
     * El roster devuelto debe ser una lista vacía, no null.
     */
    @Test
    void deberiaRetornarListaVaciaCuandoEquipoNoTieneJugadores() {
        // Arrange
        when(jugadorRepo.findByEquipoPrincipal_IdEquipo(99))
                .thenReturn(Collections.emptyList());

        // Act
        List<PublicPlayerDto> roster = publicService.getPublicRoster(99L);

        // Assert
        assertThat(roster).isNotNull().isEmpty();
    }

    /**
     * Error path: getPublicPlayerById con ID inexistente.
     * Debe lanzar ResourceNotFoundException con mensaje que identifique la entidad.
     */
    @Test
    void deberiaLanzarExcepcionCuandoJugadorNoExiste() {
        // Arrange
        when(jugadorRepo.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> publicService.getPublicPlayerById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Jugador");
    }
}

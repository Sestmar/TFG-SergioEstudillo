package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.dto.AlineacionResponseDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del AlineacionService.
 * No levanta contexto de Spring — usa Mockito puro (rápido y aislado).
 *
 * Cobertura:
 *  - getAlineacion: mapeo correcto a DTO, lista vacía
 *  - guardarAlineacion: titular vs suplente, ficha con idJugador null, orden delete-save, null fichas
 *  - cerrarActa: marcador final, estadísticas sobre alineación existente,
 *                creación de nueva alineación si no existía, valores null seguros (safeInt)
 */
@ExtendWith(MockitoExtension.class)
class AlineacionServiceTest {

    @Mock private AlineacionRepository alineacionRepo;
    @Mock private PartidoRepository partidoRepo;
    @Mock private JugadorRepository jugadorRepo;
    @Mock private EquipoRepository equipoRepo;

    @InjectMocks
    private AlineacionService alineacionService;

    // ─── helpers ─────────────────────────────────────────────────────────────

    private Jugador crearJugador(int id) {
        Usuario u = new Usuario();
        u.setNombre("Jugador" + id);
        u.setApellidos("Test");
        Jugador j = new Jugador();
        j.setIdJugador(id);
        j.setUsuario(u);
        j.setDorsal(id);
        j.setPosicion("Defensa");
        return j;
    }

    private Partido crearPartido(long id) {
        Partido p = new Partido();
        p.setIdPartido(id);
        p.setEstado("PENDIENTE");
        return p;
    }

    private Alineacion crearAlineacion(Partido p, Jugador j, String slotId, boolean titular) {
        Alineacion a = new Alineacion();
        a.setId(1L);
        a.setPartido(p);
        a.setJugador(j);
        a.setSlotId(slotId);
        a.setEsTitular(titular);
        a.setGoles(0);
        a.setAsistencias(0);
        a.setMinutosJugados(0);
        a.setTarjetaAmarilla(false);
        a.setTarjetaRoja(false);
        a.setEsCapitan(false);
        a.setEsLanzadorPenaltis(false);
        a.setEsLanzadorFaltas(false);
        return a;
    }

    // ─── getAlineacion ────────────────────────────────────────────────────────

    /**
     * Happy path: la alineación se mapea correctamente a DTO con datos del jugador.
     */
    @Test
    void deberiaRetornarDtosConDatosDelJugadorCorrectamente() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(10);
        Alineacion a = crearAlineacion(p, j, "DEF_1", true);
        a.setGoles(1);
        a.setAsistencias(2);
        when(alineacionRepo.findByPartidoIdPartido(1L)).thenReturn(List.of(a));

        // Act
        List<AlineacionResponseDto> result = alineacionService.getAlineacion(1L);

        // Assert
        assertThat(result).hasSize(1);
        AlineacionResponseDto dto = result.get(0);
        assertThat(dto.getIdJugador()).isEqualTo(10);
        assertThat(dto.getNombre()).isEqualTo("Jugador10");
        assertThat(dto.getSlotId()).isEqualTo("DEF_1");
        assertThat(dto.getEsTitular()).isTrue();
        assertThat(dto.getGoles()).isEqualTo(1);
        assertThat(dto.getAsistencias()).isEqualTo(2);
    }

    /**
     * Edge case: sin alineaciones para el partido — devuelve lista vacía, no null.
     */
    @Test
    void deberiaRetornarListaVaciaCuandoNoHayAlineacion() {
        // Arrange
        when(alineacionRepo.findByPartidoIdPartido(99L)).thenReturn(Collections.emptyList());

        // Act
        List<AlineacionResponseDto> result = alineacionService.getAlineacion(99L);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    // ─── guardarAlineacion ────────────────────────────────────────────────────

    /**
     * Happy path: slot que no empieza por BENCH → esTitular = true.
     */
    @Test
    void deberiaGuardarJugadorComoTitularCuandoSlotNoEsBench() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(5);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(jugadorRepo.findById(5)).thenReturn(Optional.of(j));

        AlineacionDto ficha = new AlineacionDto(1L, 5, "DEL_1", false);

        // Act
        alineacionService.guardarAlineacion(1L, List.of(ficha));

        // Assert
        verify(alineacionRepo).save(argThat(al -> Boolean.TRUE.equals(al.getEsTitular())));
    }

    /**
     * Happy path: slot que empieza por BENCH → esTitular = false.
     */
    @Test
    void deberiaGuardarJugadorComoSuplenteCuandoSlotEsBench() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(6);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(jugadorRepo.findById(6)).thenReturn(Optional.of(j));

        AlineacionDto ficha = new AlineacionDto(1L, 6, "BENCH_6", false);

        // Act
        alineacionService.guardarAlineacion(1L, List.of(ficha));

        // Assert
        verify(alineacionRepo).save(argThat(al -> Boolean.FALSE.equals(al.getEsTitular())));
    }

    /**
     * Edge case: ficha con idJugador null debe ser ignorada silenciosamente.
     */
    @Test
    void deberiaOmitirFichasCuandoIdJugadorEsNulo() {
        // Arrange
        Partido p = crearPartido(1L);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));

        AlineacionDto fichaInvalida = new AlineacionDto();
        fichaInvalida.setIdJugador(null);
        fichaInvalida.setSlotId("SLOT_1");

        // Act
        alineacionService.guardarAlineacion(1L, List.of(fichaInvalida));

        // Assert: ninguna alineación guardada
        verify(alineacionRepo, never()).save(any());
    }

    /**
     * El orden de operaciones debe ser: deleteByPartidoIdPartido → flush → save.
     * Esto garantiza que la alineación anterior se borra antes de escribir la nueva.
     */
    @Test
    void deberiaEliminarAlineacionPreviaAntesDeGuardarLaNueva() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(7);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(jugadorRepo.findById(7)).thenReturn(Optional.of(j));

        AlineacionDto ficha = new AlineacionDto(1L, 7, "MED_1", false);

        // Act
        alineacionService.guardarAlineacion(1L, List.of(ficha));

        // Assert: orden garantizado
        InOrder orden = inOrder(alineacionRepo);
        orden.verify(alineacionRepo).deleteByPartidoIdPartido(1L);
        orden.verify(alineacionRepo).flush();
        orden.verify(alineacionRepo).save(any(Alineacion.class));
    }

    /**
     * Edge case: fichas null → borra alineaciones existentes y retorna sin guardar nada nuevo.
     */
    @Test
    void deberiaEliminarExistentesYNoGuardarNadaSiFichasEsNull() {
        // Act
        alineacionService.guardarAlineacion(1L, null);

        // Assert: borra lo viejo pero no crea nada nuevo ni busca el partido
        verify(alineacionRepo).deleteByPartidoIdPartido(1L);
        verify(alineacionRepo).flush();
        verify(alineacionRepo, never()).save(any());
        verify(partidoRepo, never()).findById(any());
    }

    // ─── cerrarActa ───────────────────────────────────────────────────────────

    /**
     * Happy path: el partido queda FINALIZADO con el marcador correcto.
     */
    @Test
    void deberiaCerrarActaYMarcarPartidoComoFinalizado() {
        // Arrange
        Partido p = crearPartido(1L);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 1);
        payload.put("golesFavor", 2);
        payload.put("golesContra", 1);

        // Act
        alineacionService.cerrarActa(payload);

        // Assert
        assertThat(p.getEstado()).isEqualTo("FINALIZADO");
        assertThat(p.getGolesFavor()).isEqualTo(2);
        assertThat(p.getGolesContra()).isEqualTo(1);
        verify(partidoRepo).save(p);
    }

    /**
     * Happy path: las estadísticas se aplican a la alineación existente del jugador.
     */
    @Test
    void deberiaCerrarActaActualizandoEstadisticasSobreAlineacionExistente() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(10);
        Alineacion alineacion = crearAlineacion(p, j, "DEL_1", true);

        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(alineacionRepo.findFichaExacta(1L, 10)).thenReturn(Optional.of(alineacion));

        Map<String, Object> stat = new HashMap<>();
        stat.put("idJugador", 10);
        stat.put("goles", 2);
        stat.put("asistencias", 1);
        stat.put("minutos", 80);

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 1);
        payload.put("golesFavor", 2);
        payload.put("golesContra", 0);
        payload.put("estadisticas", List.of(stat));

        // Act
        alineacionService.cerrarActa(payload);

        // Assert
        assertThat(alineacion.getGoles()).isEqualTo(2);
        assertThat(alineacion.getAsistencias()).isEqualTo(1);
        assertThat(alineacion.getMinutosJugados()).isEqualTo(80);
        verify(alineacionRepo).save(alineacion);
    }

    /**
     * Edge case: jugador participó en el partido pero no tiene ficha previa.
     * El servicio debe crear una nueva con slotId "BENCH_{idJugador}".
     */
    @Test
    void deberiaCerrarActaCreandoAlineacionNuevaSiNoExistia() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(20);
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(alineacionRepo.findFichaExacta(1L, 20)).thenReturn(Optional.empty());
        when(jugadorRepo.findById(20)).thenReturn(Optional.of(j));

        Map<String, Object> stat = new HashMap<>();
        stat.put("idJugador", 20);
        stat.put("goles", 1);
        stat.put("asistencias", 0);
        stat.put("minutos", 45);

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 1);
        payload.put("golesFavor", 1);
        payload.put("golesContra", 0);
        payload.put("estadisticas", List.of(stat));

        // Act
        alineacionService.cerrarActa(payload);

        // Assert: se crea con el slotId de suplente y los datos correctos
        verify(alineacionRepo).save(argThat(al ->
                al.getJugador().getIdJugador() == 20 &&
                al.getGoles() == 1 &&
                "BENCH_20".equals(al.getSlotId())
        ));
    }

    /**
     * Edge case: campos de estadísticas son null — safeInt() debe convertirlos a 0
     * sin lanzar NullPointerException.
     */
    @Test
    void deberiaManejarValoresNulosEnEstadisticasSinLanzarExcepcion() {
        // Arrange
        Partido p = crearPartido(1L);
        Jugador j = crearJugador(15);
        Alineacion alineacion = crearAlineacion(p, j, "DEF_2", true);

        when(partidoRepo.findById(1L)).thenReturn(Optional.of(p));
        when(alineacionRepo.findFichaExacta(1L, 15)).thenReturn(Optional.of(alineacion));

        Map<String, Object> stat = new HashMap<>();
        stat.put("idJugador", 15);
        stat.put("goles", null);
        stat.put("asistencias", null);
        stat.put("minutos", null);

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 1);
        payload.put("golesFavor", 0);
        payload.put("golesContra", 0);
        payload.put("estadisticas", List.of(stat));

        // Act & Assert: no debe lanzar ninguna excepción
        assertThatCode(() -> alineacionService.cerrarActa(payload))
                .doesNotThrowAnyException();
        assertThat(alineacion.getGoles()).isZero();
        assertThat(alineacion.getAsistencias()).isZero();
        assertThat(alineacion.getMinutosJugados()).isZero();
    }
}

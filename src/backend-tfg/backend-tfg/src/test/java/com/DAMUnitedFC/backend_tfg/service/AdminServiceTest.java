package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del AdminService.
 * No levanta contexto de Spring — usa Mockito puro (rápido y aislado).
 * El servicio se construye manualmente en @BeforeEach para inyectar
 * el @Value("${app.backend.url}") sin necesidad de Spring.
 *
 * Cobertura:
 *  - crearUsuario: happy path JUGADOR y ENTRENADOR, email duplicado, normalización de rol
 *  - actualizarUsuario: actualización de campos y excepción por usuario inexistente
 *  - deleteUsuario: cascade correcto (alineaciones → jugador → usuario) y excepción
 *  - cerrarActaAdmin: cierre de acta, estadísticas por jugador, resultado final
 *  - getUsuariosActivos: filtrado de ADMINs de la lista
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UsuarioRepository usuarioRepo;
    @Mock private JugadorRepository jugadorRepo;
    @Mock private EquipoRepository equipoRepo;
    @Mock private EntrenadorRepository entrenadorRepo;
    @Mock private EquipoEntrenadorRepository equipoEntrenadorRepo;
    @Mock private CategoriaRepository categoriaRepo;
    @Mock private PartidoRepository partidoRepo;
    @Mock private AlineacionRepository alineacionRepo;
    @Mock private AsistenciaRepository asistenciaRepo;
    @Mock private LigaRepository ligaRepo;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private PartidoService partidoService;
    @Mock private NotificationService notificationService;      

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        // Construcción manual: evita @Value y cualquier contexto de Spring
        adminService = new AdminService(
                usuarioRepo, jugadorRepo, equipoRepo, entrenadorRepo,
                equipoEntrenadorRepo, categoriaRepo, partidoRepo,
                alineacionRepo, asistenciaRepo, ligaRepo, passwordEncoder,
                partidoService, notificationService, "http://localhost:8080"
        );
    }
    // ─── helpers ─────────────────────────────────────────────────────────────

    private Usuario crearUsuario(int id, String nombre, String rol) {
        Usuario u = new Usuario();
        u.setIdUsuario(id);
        u.setNombre(nombre);
        u.setEmail(nombre.toLowerCase() + "@test.com");
        u.setRol(rol);
        return u;
    }

    // ─── crearUsuario ─────────────────────────────────────────────────────────

    /**
     * Happy path: crear un JUGADOR sin password explícita.
     * El servicio debe usar "123456" como contraseña por defecto
     * y NO crear registro en la tabla entrenador.
     */
    @Test
    void deberiaCrrarUsuarioJugadorConPasswordPorDefecto() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("nombre", "Carlos");
        payload.put("email", "carlos@test.com");
        payload.put("rol", "JUGADOR");
        // sin password → debe usar "123456"

        when(usuarioRepo.findByEmail("carlos@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123456")).thenReturn("hashed_123456");
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setIdUsuario(1);
            return u;
        });

        // Act
        adminService.crearUsuario(payload);

        // Assert
        verify(passwordEncoder).encode("123456");
        verify(usuarioRepo).save(argThat(u -> "JUGADOR".equals(u.getRol())));
        verify(entrenadorRepo, never()).save(any());
    }

    /**
     * Happy path: crear un ENTRENADOR.
     * El servicio debe crear el Usuario Y el registro Entrenador vinculado.
     */
    @Test
    void deberiaCrrarEntrenadorYRegistrarloEnTablaEntrenador() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("nombre", "Juan");
        payload.put("email", "juan@test.com");
        payload.put("rol", "ENTRENADOR");
        payload.put("password", "secret");

        when(usuarioRepo.findByEmail("juan@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("hashed");
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setIdUsuario(2);
            u.setRol("ENTRENADOR");
            return u;
        });

        // Act
        adminService.crearUsuario(payload);

        // Assert
        verify(entrenadorRepo).save(argThat(e -> e.getUsuario() != null));
    }

    /**
     * Error path: email ya registrado.
     * Debe lanzar RuntimeException antes de tocar el encoder.
     */
    @Test
    void deberiaLanzarExcepcionSiEmailYaExiste() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "duplicado@test.com");
        payload.put("rol", "JUGADOR");
        when(usuarioRepo.findByEmail("duplicado@test.com"))
                .thenReturn(Optional.of(crearUsuario(1, "Existente", "JUGADOR")));

        // Act & Assert
        assertThatThrownBy(() -> adminService.crearUsuario(payload))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email");
        verify(passwordEncoder, never()).encode(any());
    }

    /**
     * Normalización de rol: el frontend puede enviar "ROLE_ENTRENADOR".
     * El servicio debe guardar "ENTRENADOR" (sin prefijo ROLE_).
     */
    @Test
    void deberiaEliminarPrefixoROLE_AlNormalizarRol() {
        // Arrange
        Map<String, Object> payload = new HashMap<>();
        payload.put("nombre", "Mister");
        payload.put("email", "mister@test.com");
        payload.put("rol", "ROLE_ENTRENADOR");
        payload.put("password", "pass");

        when(usuarioRepo.findByEmail("mister@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            // el service llama setRol("ENTRENADOR") antes del save — lo verificamos
            return u;
        });

        // Act
        adminService.crearUsuario(payload);

        // Assert: rol guardado debe ser "ENTRENADOR", no "ROLE_ENTRENADOR"
        verify(usuarioRepo).save(argThat(u -> "ENTRENADOR".equals(u.getRol())));
    }

    // ─── actualizarUsuario ────────────────────────────────────────────────────

    /**
     * Happy path: los campos del payload se aplican al usuario.
     */
    @Test
    void deberiaActualizarCamposDelUsuarioCuandoExiste() {
        // Arrange
        Usuario existente = crearUsuario(10, "Pedro", "JUGADOR");
        when(usuarioRepo.findById(10)).thenReturn(Optional.of(existente));
        when(jugadorRepo.findByUsuario_IdUsuario(10)).thenReturn(Optional.empty());

        Map<String, Object> payload = new HashMap<>();
        payload.put("nombre", "Pedro Actualizado");
        payload.put("telefono", "666111222");

        // Act
        adminService.actualizarUsuario(10, payload);

        // Assert
        assertThat(existente.getNombre()).isEqualTo("Pedro Actualizado");
        assertThat(existente.getTelefono()).isEqualTo("666111222");
        verify(usuarioRepo).save(existente);
    }

    /**
     * Error path: usuario inexistente lanza RuntimeException.
     */
    @Test
    void deberiaLanzarExcepcionAlActualizarUsuarioInexistente() {
        // Arrange
        when(usuarioRepo.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> adminService.actualizarUsuario(999, new HashMap<>()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    // ─── deleteUsuario ────────────────────────────────────────────────────────

    /**
     * Happy path: al eliminar un usuario con jugador asociado, el cascade
     * debe respetar el orden: primero alineaciones → luego jugador → luego usuario.
     */
    @Test
    void deberiaEliminarJugadorYSusAlineacionesEnCascadaOrdenado() {
        // Arrange
        Jugador jugador = new Jugador();
        jugador.setIdJugador(5);
        when(usuarioRepo.existsById(10)).thenReturn(true);
        when(jugadorRepo.findByUsuario_IdUsuario(10)).thenReturn(Optional.of(jugador));
        when(entrenadorRepo.findByUsuario_IdUsuario(10)).thenReturn(Optional.empty());

        // Act
        adminService.deleteUsuario(10);

        // Assert: orden de operaciones garantizado
        InOrder orden = inOrder(alineacionRepo, jugadorRepo, usuarioRepo);
        orden.verify(alineacionRepo).deleteByJugador(jugador);
        orden.verify(jugadorRepo).delete(jugador);
        orden.verify(usuarioRepo).deleteById(10);
    }

    /**
     * Error path: eliminar un usuario que no existe lanza RuntimeException.
     */
    @Test
    void deberiaLanzarExcepcionAlEliminarUsuarioInexistente() {
        // Arrange
        when(usuarioRepo.existsById(404)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> adminService.deleteUsuario(404))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    // ─── cerrarActaAdmin ──────────────────────────────────────────────────────

    /**
     * Happy path: el partido pasa a FINALIZADO con el marcador correcto.
     */
    @Test
    void deberiaCerrarActaYActualizarEstadoPartido() {
        // Arrange
        Partido partido = new Partido();
        partido.setIdPartido(1L);
        partido.setEstado("PENDIENTE");
        when(partidoRepo.findById(1L)).thenReturn(Optional.of(partido));

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 1);
        payload.put("golesFavor", 3);
        payload.put("golesContra", 1);
        // estadisticas null → solo cierra el partido

        // Act
        adminService.cerrarActaAdmin(payload);

        // Assert
        assertThat(partido.getEstado()).isEqualTo("FINALIZADO");
        assertThat(partido.getGolesFavor()).isEqualTo(3);
        assertThat(partido.getGolesContra()).isEqualTo(1);
        verify(partidoRepo).save(partido);
    }

    /**
     * Happy path: estadísticas individuales se aplican a la alineación existente.
     */
    @Test
    void deberiaCerrarActaActualizandoEstadisticasDeJugadorExistente() {
        // Arrange
        Partido partido = new Partido();
        partido.setIdPartido(2L);
        Jugador jugador = new Jugador();
        jugador.setIdJugador(7);
        Alineacion alineacion = new Alineacion();
        alineacion.setJugador(jugador);

        when(partidoRepo.findById(2L)).thenReturn(Optional.of(partido));
        when(jugadorRepo.findById(7)).thenReturn(Optional.of(jugador));
        when(alineacionRepo.findByPartidoAndJugador(partido, jugador))
                .thenReturn(Optional.of(alineacion));

        Map<String, Object> estadistica = new HashMap<>();
        estadistica.put("idJugador", 7);
        estadistica.put("goles", 2);
        estadistica.put("asistencias", 1);
        estadistica.put("minutos", 90);
        estadistica.put("esTitular", true);

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 2);
        payload.put("golesFavor", 2);
        payload.put("golesContra", 0);
        payload.put("estadisticas", List.of(estadistica));

        // Act
        adminService.cerrarActaAdmin(payload);

        // Assert
        assertThat(alineacion.getGoles()).isEqualTo(2);
        assertThat(alineacion.getAsistencias()).isEqualTo(1);
        assertThat(alineacion.getMinutosJugados()).isEqualTo(90);
        verify(alineacionRepo).save(alineacion);
    }

    /**
     * Edge case: jugador en estadísticas no existe en BD.
     * El servicio hace jugadorRepo.findById().orElse(null) y hace continue — no debe explotar.
     */
    @Test
    void deberiaIgnorarJugadorInexistenteEnEstadisticasSinExplotar() {
        // Arrange
        Partido partido = new Partido();
        partido.setIdPartido(3L);
        when(partidoRepo.findById(3L)).thenReturn(Optional.of(partido));
        when(jugadorRepo.findById(999)).thenReturn(Optional.empty());

        Map<String, Object> estadistica = new HashMap<>();
        estadistica.put("idJugador", 999);
        estadistica.put("goles", 1);

        Map<String, Object> payload = new HashMap<>();
        payload.put("idPartido", 3);
        payload.put("golesFavor", 1);
        payload.put("golesContra", 0);
        payload.put("estadisticas", List.of(estadistica));

        // Act & Assert
        assertThatCode(() -> adminService.cerrarActaAdmin(payload))
                .doesNotThrowAnyException();
        verify(alineacionRepo, never()).save(any());
    }

    // ─── getUsuariosActivos ───────────────────────────────────────────────────

    /**
     * Los usuarios con rol ADMIN deben ser excluidos del listado de activos.
     */
    @Test
    void deberiaFiltrarAdminsDeListaDeUsuariosActivos() {       
        // Arrange
        Usuario jugador = crearUsuario(2, "Jugador", "JUGADOR");
        // El repositorio ya filtra los admins en DB via findAllExcluyendoAdmin
        when(usuarioRepo.findAllExcluyendoAdmin()).thenReturn(List.of(jugador));
        when(jugadorRepo.findAll()).thenReturn(List.of());
        when(entrenadorRepo.findAll()).thenReturn(List.of());
        when(equipoEntrenadorRepo.findAll()).thenReturn(List.of());

        // Act
        List<Map<String, Object>> activos = adminService.getUsuariosActivos();

        // Assert
        assertThat(activos).hasSize(1);
        assertThat(activos.get(0).get("email")).isEqualTo("jugador@test.com");
    }
    /**
     * Si no hay usuarios (o todos son admins), debe devolver lista vacía — nunca null.
     */
    @Test
    void deberiaRetornarListaVaciaCuandoTodosLosUsuariosSonAdmin() {
        // Arrange
        // Si todos son ADMIN, findAllExcluyendoAdmin devuelve lista vacía
        when(usuarioRepo.findAllExcluyendoAdmin()).thenReturn(List.of());
        when(jugadorRepo.findAll()).thenReturn(List.of());
        when(entrenadorRepo.findAll()).thenReturn(List.of());
        when(equipoEntrenadorRepo.findAll()).thenReturn(List.of());

        // Act
        List<Map<String, Object>> activos = adminService.getUsuariosActivos();

        // Assert
        assertThat(activos).isNotNull().isEmpty();
    }
}

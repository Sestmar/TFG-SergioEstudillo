package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlineacionRepository extends JpaRepository<Alineacion, Long> {

    // ✅ 1. PARA ARREGLAR ERROR ROJO EN AlineacionController (Lista de alineación)
    // Spring Data es listo: entiende "Partido" + "IdPartido"
    List<Alineacion> findByPartidoIdPartido(Long idPartido);

    // ✅ 2. PARA ARREGLAR ERROR ROJO EN AlineacionController (Buscar ficha específica)
    @Query("SELECT a FROM Alineacion a WHERE a.partido.idPartido = :idPartido AND a.jugador.idJugador = :idJugador")
    Optional<Alineacion> findFichaExacta(@Param("idPartido") Long idPartido, @Param("idJugador") Integer idJugador);

    // ✅ 3. PARA EL ADMIN (Alternativa más limpia usando objetos, la usaremos en AdminController)
    Optional<Alineacion> findByPartidoAndJugador(Partido partido, Jugador jugador);

    // Métodos auxiliares
    List<Alineacion> findByJugador(Jugador jugador);
    void deleteByJugador(Jugador jugador);
    void deleteByPartidoIdPartido(Long idPartido);

    // --- ESTADÍSTICAS ---
    @Query("SELECT COUNT(a) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador AND a.minutosJugados > 0")
    Integer countPartidosJugados(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.goles) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumGoles(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.asistencias) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumAsistencias(@Param("idJugador") Integer idJugador);

    @Query("SELECT SUM(a.minutosJugados) FROM Alineacion a WHERE a.jugador.idJugador = :idJugador")
    Integer sumMinutos(@Param("idJugador") Integer idJugador);
}
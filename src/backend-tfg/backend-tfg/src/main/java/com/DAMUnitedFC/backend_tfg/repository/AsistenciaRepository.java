package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Asistencia;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findByIdEntrenamiento(Long idEntrenamiento);
    Optional<Asistencia> findByIdEntrenamientoAndJugador(Long idEntrenamiento, Jugador jugador);
    List<Asistencia> findByJugador(Jugador jugador);
    void deleteByidEntrenamiento(Long id);

    @Query("SELECT a.idEntrenamiento FROM Asistencia a WHERE a.jugador.idJugador = :idJugador AND a.estado = 'PRESENT'")
    List<Long> findEntrenamientosConfirmadosByJugadorId(@Param("idJugador") Integer idJugador);
}
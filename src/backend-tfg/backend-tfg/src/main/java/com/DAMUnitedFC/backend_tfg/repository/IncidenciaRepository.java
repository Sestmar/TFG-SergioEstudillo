package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Integer> {

    @Query("SELECT i FROM Incidencia i WHERE i.jugador.idJugador = :idJugador ORDER BY i.fechaReporte DESC")
    List<Incidencia> findByJugadorId(@Param("idJugador") Integer idJugador);
}
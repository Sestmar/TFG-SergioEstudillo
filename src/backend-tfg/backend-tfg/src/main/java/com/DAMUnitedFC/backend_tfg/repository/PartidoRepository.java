package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {
    // Para listar en el Dashboard: "Dame los partidos del equipo X"
    List<Partido> findByEquipo_IdEquipoOrderByFechaHoraAsc(Long idEquipo);

    // Para el scheduler de recordatorios: partidos cuya fecha cae en una ventana de tiempo
    List<Partido> findByFechaHoraBetween(LocalDateTime desde, LocalDateTime hasta);

    // Para Season Analytics: partidos competitivos finalizados, más reciente primero
    List<Partido> findByEquipo_IdEquipoAndEstadoAndTipoOrderByFechaHoraDesc(Integer idEquipo, String estado, String tipo);
}
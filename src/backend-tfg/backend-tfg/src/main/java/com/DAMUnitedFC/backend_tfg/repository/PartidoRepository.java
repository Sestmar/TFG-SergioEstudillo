package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {
    // Para listar en el Dashboard: "Dame los partidos del equipo X"
    List<Partido> findByIdEquipoOrderByFechaHoraAsc(Long idEquipo);
}
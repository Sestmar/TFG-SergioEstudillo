package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenadorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipoEntrenadorRepository extends JpaRepository<EquipoEntrenador, EquipoEntrenadorId> {

    // 1. Busca asignaciones por Entrenador (Para el dashboard del coach)
    List<EquipoEntrenador> findByEntrenador_IdEntrenador(Integer idEntrenador);

    // 2. 🔥 NUEVO: Busca asignaciones por Equipo (Para el detalle del Admin)
    // Esto busca dentro de la Clave Compuesta (EmbeddedId) el campo idEquipo
    List<EquipoEntrenador> findById_IdEquipo(Integer idEquipo);

    // 3. Para borrar en cascada
    void deleteByEntrenador(Entrenador entrenador);
}
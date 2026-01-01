package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenador;
import com.DAMUnitedFC.backend_tfg.model.EquipoEntrenadorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipoEntrenadorRepository extends JpaRepository<EquipoEntrenador, EquipoEntrenadorId> {

    // Busca todas las asignaciones de un entrenador usando su ID
    // Spring navega: Objeto 'entrenador' -> Campo 'idEntrenador'
    List<EquipoEntrenador> findByEntrenador_IdEntrenador(Integer idEntrenador);
    void deleteByEntrenador(Entrenador entrenador);
}
package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrenadorRepository extends JpaRepository<Entrenador, Integer> {

    // Busca el perfil de entrenador asociado a un usuario (Login)
    Optional<Entrenador> findByUsuario_IdUsuario(Integer idUsuario);

    // 🔥 NUEVO: Encuentra entrenadores que NO están en la tabla intermedia 'equipo_entrenador'
    // Es decir, entrenadores libres o pendientes de asignar
    @Query("SELECT e FROM Entrenador e WHERE e.idEntrenador NOT IN (SELECT ee.entrenador.idEntrenador FROM EquipoEntrenador ee)")
    List<Entrenador> findEntrenadoresSinEquipo();
}
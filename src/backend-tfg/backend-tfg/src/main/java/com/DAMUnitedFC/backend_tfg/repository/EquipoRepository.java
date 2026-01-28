package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {

    // Query derivada de Spring Data JPA:
    // SELECT * FROM Equipo e
    // JOIN Entrenador ent ON e.id_entrenador = ent.id
    // WHERE ent.id_usuario = :idUsuario
    Optional<Equipo> findByEntrenador_Usuario_IdUsuario(Integer idUsuario);
    // Buscar equipos dirigidos por un entrenador
    List<Equipo> findByEntrenador(Entrenador entrenador);
    Optional<Equipo> findByEntrenador_IdEntrenador(Integer idEntrenador);
}
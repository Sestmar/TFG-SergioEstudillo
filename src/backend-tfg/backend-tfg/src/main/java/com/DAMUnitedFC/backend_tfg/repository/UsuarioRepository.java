package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Necesario para la @Query
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    // 1. Candidatos a JUGADOR
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.rol) = 'jugador' AND u.idUsuario NOT IN (SELECT j.usuario.idUsuario FROM Jugador j)")
    List<Usuario> findCandidatosSinEquipo();

    // 2. Candidatos a STAFF
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.rol) = 'entrenador' AND u.idUsuario NOT IN (SELECT e.usuario.idUsuario FROM Entrenador e)")
    List<Usuario> findEntrenadoresDisponibles();

    // 3. Todos los usuarios excepto admins (para el panel de administración)
    @Query("SELECT u FROM Usuario u WHERE u.rol NOT IN ('ADMIN', 'ROLE_ADMIN')")
    List<Usuario> findAllExcluyendoAdmin();

}
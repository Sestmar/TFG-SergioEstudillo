package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JugadorRepository extends JpaRepository<Jugador, Integer> {

    Optional<Jugador> findByUsuario_IdUsuario(Integer idUsuario); // Ojo: Integer/Long según tu ID

    List<Jugador> findByEquipoPrincipal_IdEquipo(Integer idEquipo);

    // 🔥 MÉTODO NUEVO PARA EL DASHBOARD DE ADMIN
    long countByEquipoPrincipal(Equipo equipo);
}
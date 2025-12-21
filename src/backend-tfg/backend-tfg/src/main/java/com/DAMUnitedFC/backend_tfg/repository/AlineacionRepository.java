package com.DAMUnitedFC.backend_tfg.repository;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
public interface AlineacionRepository extends JpaRepository<Alineacion, Long> {

    // --- MÉTODOS ANTIGUOS (POR SI LOS NECESITAS) ---
    List<Alineacion> findByIdEquipo(Long idEquipo);

    @Transactional
    void deleteByIdEquipo(Long idEquipo);


    // --- ✅ MÉTODOS NUEVOS (PARA PARTIDOS) ---
    // Buscar todas las posiciones de un partido concreto
    List<Alineacion> findByIdPartido(Long idPartido);

    // Borrar la táctica de un partido (Necesario antes de guardar la nueva)
    @Transactional
    void deleteByIdPartido(Long idPartido);
}
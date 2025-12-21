package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional; // ✅ Importante para el delete

import java.util.List;

@RestController
@RequestMapping("/api/alineaciones")
@CrossOrigin(origins = "*") // Permite peticiones desde Ionic
public class AlineacionController {

    @Autowired
    private AlineacionRepository alineacionRepo;

    // ✅ OBTENER: Cargar alineación de un PARTIDO específico
    // Ruta ejemplo: GET /api/alineaciones/partido/25
    @GetMapping("/partido/{idPartido}")
    public List<Alineacion> getAlineacionPartido(@PathVariable Long idPartido) {
        return alineacionRepo.findByIdPartido(idPartido);
    }

    // ✅ GUARDAR: Guardar alineación para un PARTIDO (Sobrescribe la anterior)
    // Ruta ejemplo: POST /api/alineaciones/partido/25
    @PostMapping("/partido/{idPartido}")
    @Transactional // ✅ Necesario para ejecutar delete y save en la misma operación
    public List<Alineacion> saveAlineacionPartido(@PathVariable Long idPartido, @RequestBody List<Alineacion> nuevasPosiciones) {

        // 1. Borrar la táctica vieja de ESTE partido para evitar duplicados
        alineacionRepo.deleteByIdPartido(idPartido);

        // 2. Asignar el ID del partido a todas las nuevas posiciones (por seguridad)
        nuevasPosiciones.forEach(a -> a.setIdPartido(idPartido));

        // 3. Guardar la nueva lista
        return alineacionRepo.saveAll(nuevasPosiciones);
    }
}
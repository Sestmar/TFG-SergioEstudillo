package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    @Autowired
    private PartidoRepository partidoRepo;

    // 1. Crear un Partido (Desde el modal "Nueva Convocatoria")
    @PostMapping
    public Partido createPartido(@RequestBody Partido partido) {
        return partidoRepo.save(partido);
    }

    // 2. Listar partidos de un equipo (Para el Dashboard)
    @GetMapping("/equipo/{idEquipo}")
    public List<Partido> getPartidosPorEquipo(@PathVariable Long idEquipo) {
        return partidoRepo.findByIdEquipoOrderByFechaHoraAsc(idEquipo);
    }

    // 3. Obtener detalle de UN partido (Para entrar a la Pizarra)
    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartido(@PathVariable Long id) {
        return partidoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

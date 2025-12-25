package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.dto.AlineacionResponseDto; // Importar el nuevo DTO
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alineaciones")
@CrossOrigin(origins = "*")
public class AlineacionController {

    @Autowired
    private AlineacionRepository alineacionRepo;
    @Autowired
    private PartidoRepository partidoRepo;
    @Autowired
    private JugadorRepository jugadorRepo;

    // 🔥 CAMBIO CRÍTICO: Devolvemos List<AlineacionResponseDto> en lugar de la Entidad
    @GetMapping("/partido/{idPartido}")
    public ResponseEntity<List<AlineacionResponseDto>> getAlineacion(@PathVariable Long idPartido) {

        List<Alineacion> alineaciones = alineacionRepo.findByPartidoIdPartido(idPartido);
        List<AlineacionResponseDto> response = new ArrayList<>();

        // Mapeo Manual: Entidad -> DTO Plano
        // Esto rompe cualquier vínculo con Hibernate y evita el bucle infinito.
        for (Alineacion a : alineaciones) {
            AlineacionResponseDto dto = new AlineacionResponseDto();
            dto.setId(a.getId());
            dto.setIdPartido(a.getPartido().getIdPartido());

            if (a.getJugador() != null) {
                Jugador j = a.getJugador();
                dto.setIdJugador(j.getIdJugador());
                dto.setDorsal(j.getDorsal());
                dto.setPosicion(j.getPosicion());

                // Prioridad foto: Jugador > Usuario
                dto.setFotoUrl(j.getFotoUrl());

                if (j.getUsuario() != null) {
                    dto.setNombre(j.getUsuario().getNombre());
                    dto.setApellidos(j.getUsuario().getApellidos());
                    if (dto.getFotoUrl() == null) {
                        dto.setFotoUrl(j.getUsuario().getFotoUrl());
                    }
                }
            }

            dto.setSlotId(a.getSlotId());
            dto.setEsTitular(a.getEsTitular());
            dto.setGoles(a.getGoles());
            dto.setAsistencias(a.getAsistencias());
            dto.setMinutosJugados(a.getMinutosJugados());
            dto.setTarjetaAmarilla(a.getTarjetaAmarilla());
            dto.setTarjetaRoja(a.getTarjetaRoja());

            response.add(dto);
        }

        return ResponseEntity.ok(response);
    }

    // Guardar se queda igual, funciona bien
    @PostMapping("/guardar/{idPartido}")
    @Transactional
    public ResponseEntity<?> guardarAlineacion(@PathVariable Long idPartido, @RequestBody List<AlineacionDto> fichas) {
        Map<String, Object> response = new HashMap<>();
        try {
            alineacionRepo.deleteByPartidoIdPartido(idPartido);
            alineacionRepo.flush();

            if (fichas == null || fichas.isEmpty()) {
                response.put("success", true);
                response.put("mensaje", "Pizarra limpiada correctamente");
                return ResponseEntity.ok(response);
            }

            Partido p = partidoRepo.findById(idPartido)
                    .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

            for (AlineacionDto ficha : fichas) {
                if (ficha.getIdJugador() == null) continue;

                Jugador j = jugadorRepo.findById(ficha.getIdJugador())
                        .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

                Alineacion alineacion = new Alineacion();
                alineacion.setPartido(p);
                alineacion.setJugador(j);

                if (j.getEquipoPrincipal() != null) {
                    alineacion.setIdEquipo(j.getEquipoPrincipal().getIdEquipo().longValue());
                } else {
                    alineacion.setIdEquipo(p.getIdEquipo());
                }

                alineacion.setSlotId(ficha.getSlotId());
                alineacion.setEsTitular(true);
                alineacion.setGoles(0);
                alineacion.setAsistencias(0);
                alineacion.setMinutosJugados(0);
                alineacion.setTarjetaAmarilla(false);
                alineacion.setTarjetaRoja(false);

                alineacionRepo.save(alineacion);
            }

            response.put("success", true);
            response.put("mensaje", "Alineación guardada correctamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
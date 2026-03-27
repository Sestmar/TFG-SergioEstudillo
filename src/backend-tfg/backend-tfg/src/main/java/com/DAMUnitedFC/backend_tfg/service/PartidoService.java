package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.ActaDto;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PartidoService {

    private final PartidoRepository partidoRepo;
    private final AlineacionRepository alineacionRepo;
    private final JugadorRepository jugadorRepo;

    public PartidoService(PartidoRepository partidoRepo,
                          AlineacionRepository alineacionRepo,
                          JugadorRepository jugadorRepo) {
        this.partidoRepo = partidoRepo;
        this.alineacionRepo = alineacionRepo;
        this.jugadorRepo = jugadorRepo;
    }

    public Partido crear(Partido partido) {
        return partidoRepo.save(partido);
    }

    public List<Partido> listarPorEquipo(Long idEquipo) {
        return partidoRepo.findByEquipo_IdEquipoOrderByFechaHoraAsc(idEquipo);
    }

    public Optional<Partido> obtener(Long id) {
        return partidoRepo.findById(id);
    }

    public Optional<Partido> actualizar(Long id, Map<String, Object> updates) {
        return partidoRepo.findById(id).map(partido -> {
            if (updates.containsKey("rival")) partido.setRival((String) updates.get("rival"));
            if (updates.containsKey("lugar")) partido.setLugar((String) updates.get("lugar"));
            if (updates.containsKey("competicion")) partido.setCompeticion((String) updates.get("competicion"));
            if (updates.containsKey("escudoRivalUrl")) partido.setEscudoRivalUrl((String) updates.get("escudoRivalUrl"));
            return partidoRepo.save(partido);
        });
    }

    @Transactional
    public void cerrarActa(ActaDto acta) {
        Partido p = partidoRepo.findById(acta.getIdPartido())
                .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

        p.setGolesFavor(acta.getGolesFavor());
        p.setGolesContra(acta.getGolesContra());
        p.setEstado("FINALIZADO");
        partidoRepo.save(p);

        for (ActaDto.PlayerStatUpdateDto stat : acta.getEstadisticas()) {
            alineacionRepo.findFichaExacta(acta.getIdPartido(), Math.toIntExact(stat.getIdJugador()))
                    .ifPresent(ficha -> {
                        ficha.setGoles(stat.getGoles() != null ? stat.getGoles() : 0);
                        ficha.setAsistencias(stat.getAsistencias() != null ? stat.getAsistencias() : 0);
                        ficha.setMinutosJugados(stat.getMinutos() != null ? stat.getMinutos() : 0);
                        ficha.setTarjetaAmarilla(stat.getAmarilla() != null ? stat.getAmarilla() : false);
                        ficha.setTarjetaRoja(stat.getRoja() != null ? stat.getRoja() : false);
                        alineacionRepo.save(ficha);
                    });
        }
    }
}

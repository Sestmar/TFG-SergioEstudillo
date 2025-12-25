import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatchService } from 'src/app/core/services/match/match.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-match-detail',
  templateUrl: './match-detail.page.html',
  styleUrls: ['./match-detail.page.scss'],
})
export class MatchDetailPage implements OnInit {
  
  match: any = null;
  players: any[] = []; 
  myStats: any = null; 
  loading = true;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(u => {
        if (u) this.currentUserId = (u as any).id || (u as any).idUsuario;
    });

    const matchId = this.route.snapshot.paramMap.get('id');
    if (matchId) {
      this.loadMatchInfo(Number(matchId));
    }
  }

  loadMatchInfo(id: number) {
    this.loading = true;
    
    this.matchSvc.getMatchById(id).subscribe({
      next: (data) => {
        this.match = data;
        
        // Ahora alineacionRaw es una lista de DTOs planos (AlineacionResponseDto)
        this.matchSvc.getLineup(id).subscribe({
          next: (alineacionDtos: any[]) => {
            
            console.log('📋 Alineación recibida (DTO):', alineacionDtos);

            // Mapeo SIMPLIFICADO (Porque el DTO ya viene plano)
            if (alineacionDtos && alineacionDtos.length > 0) {
              this.players = alineacionDtos.map(dto => {
                return {
                    // Ya no navegamos por .jugador.usuario... viene directo
                    nombre: dto.nombre || 'Jugador',
                    apellidos: dto.apellidos || '',
                    fotoUrl: dto.fotoUrl, 
                    dorsal: dto.dorsal || '--',
                    posicion: dto.posicion || 'Sin Demarcación',
                    esTitular: dto.esTitular,
                    
                    // Datos para stats
                    goles: dto.goles,
                    asistencias: dto.asistencias,
                    minutos: dto.minutosJugados,
                    tarjetaAmarilla: dto.tarjetaAmarilla,
                    tarjetaRoja: dto.tarjetaRoja,
                    
                    // Guardamos ID jugador para calcular estadísticas personales
                    idJugador: dto.idJugador 
                };
              });

              // Calcular estadísticas personales
              // (Nota: Aquí la lógica cambia un poco porque ya no tenemos el objeto usuario anidado)
              // Pero para visualización, la lista players ya está lista.
              
              this.players.sort((a, b) => (a.esTitular === b.esTitular) ? 0 : a.esTitular ? -1 : 1);
            } else {
              this.players = [];
            }
            this.loading = false;
          },
          error: (err) => {
            console.error("❌ Error cargando alineación", err);
            this.players = [];
            this.loading = false;
          }
        });
      },
      error: (err) => {
         console.error("❌ Error cargando partido", err);
         this.loading = false;
      }
    });
  }

  // (Nota: He simplificado esto porque con el DTO plano es difícil comparar con currentUserId 
  // a menos que traigamos el idUsuario en el DTO. Para visualización básica, esto vale).
  calculateMyStats(lineup: any[]) {
      // Pendiente de ajuste si necesitas stats personales
  }

  goBack() {
    this.location.back();
  }
}
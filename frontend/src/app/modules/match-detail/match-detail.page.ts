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
        
        this.matchSvc.getLineup(id).subscribe({
          next: (alineacionDtos: any[]) => {
            console.log('📋 Alineación recibida (DTO):', alineacionDtos);

            if (alineacionDtos && alineacionDtos.length > 0) {
              this.players = alineacionDtos.map(dto => {
                return {
                    nombre: dto.nombre || 'Jugador',
                    apellidos: dto.apellidos || '',
                    fotoUrl: dto.fotoUrl, 
                    dorsal: dto.dorsal || '--',
                    posicion: dto.posicion || 'Sin Demarcación',
                    esTitular: dto.esTitular,
                    goles: dto.goles,
                    asistencias: dto.asistencias,
                    minutos: dto.minutosJugados,
                    tarjetaAmarilla: dto.tarjetaAmarilla,
                    tarjetaRoja: dto.tarjetaRoja,
                    idJugador: dto.idJugador,
                    
                    // 🔥 NUEVOS CAMPOS LEÍDOS
                    minutoEntrada: dto.minutoEntrada,
                    minutoSalida: dto.minutoSalida
                };
              });

              this.players.sort((a, b) => {
                  if (a.esTitular && !b.esTitular) return -1;
                  if (!a.esTitular && b.esTitular) return 1;
                  return (b.goles || 0) - (a.goles || 0);
              });

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

  goBack() {
    this.location.back();
  }
}
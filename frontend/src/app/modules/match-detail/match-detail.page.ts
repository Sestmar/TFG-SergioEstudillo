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
  lineup: any[] = [];
  myStats: any = null; // Aquí guardaremos los goles/minutos del jugador logueado
  loading = true;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    // 1. Obtener ID del usuario actual para buscar sus stats
    this.authSvc.currentUser$.subscribe(u => {
        if (u) this.currentUserId = (u as any).id || (u as any).idUsuario;
    });

    // 2. Obtener ID del partido de la URL
    const matchId = this.route.snapshot.paramMap.get('id');
    if (matchId) {
      this.loadMatchInfo(Number(matchId));
    }
  }

  loadMatchInfo(id: number) {
    this.loading = true;
    
    // Cargar Info General del Partido (Rival, Fecha, Resultado)
    this.matchSvc.getMatchById(id).subscribe(data => {
      this.match = data;
      
      // Cargar la Alineación (para sacar las stats individuales)
      this.matchSvc.getLineup(id).subscribe(alineacion => {
        this.lineup = alineacion;
        this.calculateMyStats();
        this.loading = false;
      });
    });
  }

  calculateMyStats() {
    if (!this.lineup || !this.currentUserId) return;

    // Buscamos en la alineación al jugador que coincida con el usuario logueado
    const myRecord = this.lineup.find(item => {
        const uId = item.jugador?.usuario?.id || item.jugador?.usuario?.idUsuario;
        return uId === this.currentUserId;
    });

    if (myRecord) {
        this.myStats = {
            jugado: true,
            titular: myRecord.esTitular,
            goles: myRecord.goles || 0,
            asistencias: myRecord.asistencias || 0,
            minutos: myRecord.minutosJugados || 0,
            amarilla: myRecord.tarjetaAmarilla,
            roja: myRecord.tarjetaRoja
        };
    }
  }

  goBack() {
    this.location.back();
  }
}
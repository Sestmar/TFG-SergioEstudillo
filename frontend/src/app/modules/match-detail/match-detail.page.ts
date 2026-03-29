import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  
  private destroyRef = inject(DestroyRef);
  match: any = null;
  players: any[] = []; 
  loading = true;
  currentUserId: number | null = null;
  
  // ✅ Control de permisos para la vista
  canEdit: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(u => {
        if (u) {
            this.currentUserId = (u as any).id || (u as any).idUsuario;
            const rol = (u.rol || '').toUpperCase();
            // Solo ADMIN puede editar/cerrar actas desde aquí
            this.canEdit = rol.includes('ADMIN');
        }
    });

    const matchId = this.route.snapshot.paramMap.get('id');
    if (matchId) {
      this.loadMatchInfo(Number(matchId));
    }
  }

  loadMatchInfo(id: number) {
    this.loading = true;
    
    this.matchSvc.getMatchById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.match = data; 
        
        this.matchSvc.getLineup(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (alineacionDtos: any[]) => {
            if (alineacionDtos && alineacionDtos.length > 0) {
              this.players = alineacionDtos.map(dto => {
                const safeImg = dto.fotoUrl || `https://ui-avatars.com/api/?name=${dto.nombre}&background=random&color=fff`;

                return {
                    ...dto,
                    nombre: dto.nombre || 'Jugador',
                    apellidos: dto.apellidos || '',
                    fotoUrl: safeImg,
                    dorsal: dto.dorsal || '--',
                    posicion: dto.posicion || 'JUG',
                    
                    esCapitan: !!dto.esCapitan,
                    esLanzadorPenaltis: !!dto.esLanzadorPenaltis,
                    esLanzadorFaltas: !!dto.esLanzadorFaltas,
                    goles: dto.goles || 0,
                    asistencias: dto.asistencias || 0 
                };
              });

              this.players.sort((a, b) => {
                  if (a.esTitular && !b.esTitular) return -1;
                  if (!a.esTitular && b.esTitular) return 1;
                  return 0;
              });

            } else {
              this.players = [];
            }
            this.loading = false;
          },
          error: (err) => {
            console.error("❌ Error alineación", err);
            this.players = [];
            this.loading = false;
          }
        });
      },
      error: (err) => {
         console.error("❌ Error partido", err);
         this.loading = false;
      }
    });
  }

  handleImgError(event: any, context: string) {
    event.target.onerror = null;
    if (context === 'rival') {
        event.target.src = 'https://cdn-icons-png.flaticon.com/512/16/16480.png'; 
    } else {
        event.target.src = `https://ui-avatars.com/api/?name=${context}&background=333&color=fff`;
    }
  }

  goBack() {
    this.location.back();
  }
}
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatchService } from 'src/app/core/services/match/match.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  
  viewDate: Date = new Date();
  currentMonthName: string = '';
  currentYear: number = 0;
  daysInMonth: number[] = [];
  emptyDays: number[] = [];
  
  selectedDate: Date = new Date();
  selectedDayEvents: any[] = [];
  allEvents: any[] = [];
  
  currentTeamId: number | null = null;

  constructor(
    private location: Location,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private coachSvc: CoachService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.generateCalendar();

    this.route.queryParams.subscribe(params => {
        if (params['teamId']) {
            console.log('Modo Admin/Visor: Cargando equipo ID', params['teamId']);
            this.currentTeamId = Number(params['teamId']);
            this.loadEvents();
        } else {
            this.detectTeamAndLoadEvents();
        }
    });
  }

  detectTeamAndLoadEvents() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;
        const rol = (u.rol || '').toUpperCase(); 

        if (rol.includes('ENTRENADOR') || rol.includes('COACH')) {
            this.coachSvc.getDashboardData(userId).subscribe((res: any) => {
                if (res.equipo) {
                    this.currentTeamId = res.equipo.idEquipo || res.equipo.id;
                    this.loadEvents();
                }
            });
        } else if (rol.includes('JUGADOR')) {
            this.http.get(`http://localhost:8080/api/jugadores/usuario/${userId}/equipo`).subscribe({
                next: (equipo: any) => {
                    if (equipo) {
                        this.currentTeamId = equipo.idEquipo || equipo.id;
                        this.loadEvents();
                    }
                },
                error: (err) => console.log("Usuario sin equipo asignado o Admin")
            });
        }
      }
    });
  }

  loadEvents() {
    if (!this.currentTeamId) return;
    this.matchSvc.getMatchesByTeam(this.currentTeamId).subscribe(matches => {
        this.allEvents = matches;
        this.selectDay(this.selectedDate.getDate()); 
    });
  }

  // MÉTODO INTELIGENTE DE REDIRECCIÓN
  onEventClick(event: any) {
      const eventId = event.idPartido || event.id;
      const tipo = event.tipo; 
      
      // ID del equipo para pasar lista
      const teamIdToPass = event.idEquipo || (event.equipo ? event.equipo.idEquipo : this.currentTeamId);

      this.authSvc.currentUser$.subscribe(user => {
          const u = user as any;
          const rol = (u.rol || '').toUpperCase();
          const isAdminOrCoach = rol.includes('ADMIN') || rol.includes('ENTRENADOR') || rol.includes('STAFF');

          // 🟢 1. SI ES ENTRENAMIENTO
          if (tipo === 'TRAINING') {
              if (isAdminOrCoach) {
                  // Admin/Entrenador -> Pasan lista
                  this.router.navigate(['/training-attendance', eventId], {
                      queryParams: { teamId: teamIdToPass }
                  });
              } else {
                  // Jugador -> No hace nada o ve detalle simple (futuro)
                  console.log("Entrenamiento (Vista Jugador)");
              }
              return;
          }

          // ⚽ 2. SI ES PARTIDO
          if (tipo === 'PARTIDO') {
               if (rol.includes('ADMIN')) {
                   this.router.navigate(['/edit-match', eventId]); 
               } else {
                   this.router.navigate(['/match-detail', eventId]);
               }
          }
      });
  }

  // RESTO DE MÉTODOS DEL CALENDARIO
  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    this.currentYear = year;
    this.currentMonthName = this.viewDate.toLocaleString('es-ES', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    this.emptyDays = Array(adjustedFirstDay).fill(0);
    this.daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToToday() {
    this.viewDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
    this.filterEventsForSelectedDate();
  }

  selectDay(day: number) {
    this.selectedDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
    this.filterEventsForSelectedDate();
  }

  filterEventsForSelectedDate() {
    this.selectedDayEvents = this.allEvents.filter(e => {
        const eDate = new Date(e.fechaHora);
        return eDate.getDate() === this.selectedDate.getDate() &&
               eDate.getMonth() === this.selectedDate.getMonth() &&
               eDate.getFullYear() === this.selectedDate.getFullYear();
    });
    this.selectedDayEvents.sort((a,b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && this.viewDate.getMonth() === today.getMonth() && this.viewDate.getFullYear() === today.getFullYear();
  }

  isSelected(day: number): boolean {
    return day === this.selectedDate.getDate() && this.viewDate.getMonth() === this.selectedDate.getMonth();
  }

  hasEvents(day: number): boolean { return this.getEventsForDay(day).length > 0; }
  hasMatch(day: number): boolean { return this.getEventsForDay(day).some(e => e.tipo === 'PARTIDO'); }
  hasTraining(day: number): boolean { 
    // Buscamos 'TRAINING' porque así lo guarda el AdminController
    return this.getEventsForDay(day).some(e => e.tipo === 'TRAINING'); 
}

  private getEventsForDay(day: number): any[] {
      return this.allEvents.filter(e => {
        const eDate = new Date(e.fechaHora);
        return eDate.getDate() === day && eDate.getMonth() === this.viewDate.getMonth() && eDate.getFullYear() === this.viewDate.getFullYear();
      });
  }

  goBack() {
    this.location.back();
  }
}
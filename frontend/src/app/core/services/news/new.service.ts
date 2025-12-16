import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Mismo patrón de imports
import { ApiService } from '../api/api.service';
import { News } from '../../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private apiService: ApiService) {}

  getNews(params: any = {}): Observable<any> {
    // Devolvemos un mock vacío por ahora para que no falle
    return of({ news: [], total: 0 });
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private apiService: ApiService) { }

  // Sube la foto al Backend (NeonDB/Disco)
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Importante: No establecer Content-Type manualmente, el navegador lo hace con el boundary correcto
    return this.apiService.post<{ url: string }>('/media/upload', formData);
  }
}
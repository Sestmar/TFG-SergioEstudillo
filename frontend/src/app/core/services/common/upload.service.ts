import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// 👇 IMPORTANTE: Importar el environment para leer la URL de Render
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  // 👇 CORRECCIÓN: Usamos la variable real + el endpoint del controlador
  // Tu FileController tiene @RequestMapping("/api/uploads") y @PostMapping("/img")
  // environment.apiUrl ya termina en "/api", así que añadimos "/uploads/img"
  private apiUrl = `${environment.apiUrl}/uploads/img`;

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); 

    return this.http.post(this.apiUrl, formData);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // URL del FileController que creaste en el backend
  private apiUrl = 'http://localhost:8080/api/uploads/img';

  constructor(private http: HttpClient) { }

  // Función para enviar el archivo al backend
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    // 'file' debe coincidir con @RequestParam("file") del FileController.java
    formData.append('file', file); 

    // Enviamos el FormData (el navegador se encarga de las cabeceras)
    return this.http.post(this.apiUrl, formData);
  }
}
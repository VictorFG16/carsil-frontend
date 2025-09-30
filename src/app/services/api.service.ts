import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Injectable({

providedIn: 'root'
})

export class ApiService {
private baseUrl = 'http://localhost:8080/api';

constructor(private http: HttpClient) {}

  // 1. Obtener datos (GET)
  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // 2. Enviar datos (POST)
  post(endpoint: string, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // 3. Actualizar datos (PUT)
  put(endpoint: string, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // 4. Eliminar datos (DELETE)
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    // Relanza el error original para que el componente que hizo la llamada
    // (en este caso, login.ts) lo maneje correctamente.
    return throwError(() => error);
  }
}

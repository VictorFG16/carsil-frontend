import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
private readonly baseUrl = `${environment.apiUrl}/api`;

constructor(private http: HttpClient) {}

  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { params }).pipe(
      retry(1),
      catchError(this.handleError),
    );
  }

  // **CORRECCIÓN TS2322/TS2769:** Se elimina el tipo genérico (<T>) y se usa Observable<any>
  // para resolver el conflicto de tipado al usar responseType: 'text'.
  post(endpoint: string, data: any, options?: { responseType: 'text' | 'json' }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Usamos 'as any' para forzar la compatibilidad con responseType: 'text'.
    return this.http.post(`${this.baseUrl}${endpoint}`, data, { headers, ...options } as any).pipe(
      retry(1),
      catchError(this.handleError),
    );
  }

  put(endpoint: string, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
      retry(1),
      catchError(this.handleError),
    );
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`).pipe(
      retry(1),
      catchError(this.handleError),
    );
  }

  private handleError(error: any) {
    let errorMessage = 'Error de conexión';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => error);
  }
}

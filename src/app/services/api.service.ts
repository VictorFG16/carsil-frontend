import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // apiUrl = 'https://...'; en dev será http://localhost:8080 (environment.development.ts)
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { params }).pipe(
      retry(1),
      catchError(this.handleError),
    );
  }

  post(endpoint: string, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}${endpoint}`, data, { headers }).pipe(
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

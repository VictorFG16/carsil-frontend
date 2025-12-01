import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService, private http: HttpClient) {}

  // Método para iniciar sesión
  login(userName: string, password: string) {
    return this.apiService.post('/auth/login', { userName, password }).pipe(
      tap((response: any) => {
        // Guardar token y nombre de usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', userName);
      })
    );
  }

  // Devuelve true si hay un token en localStorage
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Consulta el usuario actual
  getCurrentUser() {
  const name = localStorage.getItem('userName');
  if (!name) {
    return this.apiService.get('/users/by-name/anonymous');
  }
  return this.apiService.get(`/users/by-name/${encodeURIComponent(name)}`);
}

  // Cerrar sesión
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  }
}

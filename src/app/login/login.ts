import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  userName = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  onLogin() {
    this.errorMessage = ''; // limpiar mensaje previo
    this.authService.login(this.userName, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        // Lógica de manejo de errores mejorada
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Intente de nuevo.';
        }
      }
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.sessionService.resetTimer();
      this.router.navigate(['/home']);
    }
  }
}

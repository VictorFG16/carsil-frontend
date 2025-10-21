import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('carsil');
  showModal = false;
  private autoLogoutTimer: any; 

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    setInterval(() => {
      if (this.authService.isLoggedIn()) {
        const inactiveTime = this.sessionService.getInactiveTime();

        // Si lleva más de 30 minutos inactivo 
        if (inactiveTime > 30* 60* 1000 && !this.showModal) {
          this.showModal = true;
          this.startAutoLogoutTimer(); 
        }
      } else {
        this.showModal = false;
      }
    }, 10000); 
  }

  
  startAutoLogoutTimer() {
    clearTimeout(this.autoLogoutTimer);
    this.autoLogoutTimer = setTimeout(() => {
      this.logout(); 
    },  5 * 60 * 1000);
  }

  continueSession() {
    this.sessionService.resetTimer();
    this.showModal = false;
    clearTimeout(this.autoLogoutTimer); 
  }

  logout() {
    this.showModal = false;
    clearTimeout(this.autoLogoutTimer);
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}

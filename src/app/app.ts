import { Component, signal, OnInit} from '@angular/core';
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

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    setInterval(() => {
      if (this.authService.isLoggedIn()){
      const inactiveTime = this.sessionService.getInactiveTime();

      // Si lleva más de 5 min (300000 ms) sin hacer nada
      if (inactiveTime > 30 * 60 * 1000) {
        this.showModal = true;
      }
    }
    else{
      this.showModal = false;
    }
  }, 10000); // revisa cada 10s
  }

  continueSession() {
    this.sessionService.resetTimer();
    this.showModal = false;
  }

  logout() {
    this.showModal = false;
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
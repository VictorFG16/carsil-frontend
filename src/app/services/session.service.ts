import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private lastActivity = Date.now();

  constructor(private ngZone: NgZone) {
    // Escuchamos eventos del usuario
    ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }

  resetTimer() {
    this.lastActivity = Date.now();
  }

  getInactiveTime(): number {
    return Date.now() - this.lastActivity; // milisegundos inactivo
  }
}

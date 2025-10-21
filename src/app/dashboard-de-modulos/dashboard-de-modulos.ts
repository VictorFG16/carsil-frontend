import { Component, OnInit } from '@angular/core';
import { Navbar } from "../dashboard/navbar/navbar";
import { Router } from '@angular/router';
import { TeamService } from '../services/team.service';
import { CommonModule } from '@angular/common';
import { ProgressGaugeComponent } from './progress-gauge/progress-gauge.component';

@Component({
  selector: 'app-dashboard-de-modulos',
  imports: [Navbar, CommonModule, ProgressGaugeComponent],
  templateUrl: './dashboard-de-modulos.html',
  styleUrls: ['./dashboard-de-modulos.css'],
})
export class DashboardDeModulos implements OnInit {
  teams: any[] = [];
  loading = true;
  error: string | null = null;
  selectedTeam: number | null = null; 

  constructor(
    private router: Router,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAllTeams().subscribe({
      next: (data: any) => {
        this.teams = data.slice(0, 20); // Máximo 20 módulos
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los equipos';
        this.loading = false;
        
      }
    });
  }

  getTeamColor(loadDays: number): string {
    if (loadDays <= 0.49) {
      return 'red';
    } else if (loadDays <= 0.99) {
      return '#FFDE21';
    } else if (loadDays <= 7) {
      return 'green';
    } else {
      return 'red';
    }
  }

  onTeamSelect(team: any) {
    if (this.selectedTeam === team) {
      this.selectedTeam = null; // Deseleccionar si ya está seleccionado
    } else {
      this.selectedTeam = team; // Seleccionar el módulo
    }
  }
  isAnyTeamSelected(): boolean {
    return this.selectedTeam !== null;
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  agregarModulo(){
    this.router.navigate (['/agregar-modulo'])
  }
  
  editarModulo() { 
    if (this.selectedTeam !== null) {
      const teamSeleccionado = this.getTeamSeleccionado();
      this.router.navigate(['/edit-modulo', teamSeleccionado.id]);
    }
  }

  getTeamSeleccionado(): any {
    if (this.selectedTeam == null) {
      throw new Error('No hay ningún equipo seleccionado');
    }
    return this.selectedTeam;
  }
}

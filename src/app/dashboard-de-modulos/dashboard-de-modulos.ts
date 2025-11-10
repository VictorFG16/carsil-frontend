import { Component, OnInit } from '@angular/core';
import { Navbar } from "../dashboard/navbar/navbar";
import { Router } from '@angular/router';
import { TeamService } from '../services/team.service';
import { CommonModule } from '@angular/common';
import { ProgressGaugeComponent } from './progress-gauge/progress-gauge.component';
import { HttpErrorResponse } from '@angular/common/http';

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
  showDeleteModal = false;
  deleteToTeam: any = null;
  errorMessage = '';

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
        this.teams = data.slice(0, 20);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
 
  if (err.error && err.error.mensaje) {
    this.errorMessage = err.error.mensaje;
  } else if (err.error && err.error.message) {
    this.errorMessage = err.error.message;
  } else if (err.error && typeof err.error === 'string') {
    this.errorMessage = err.error;
  } else if (err.message) {
    this.errorMessage = err.message;
  } else {
    this.errorMessage = 'Ocurrió un error inesperado. Intente de nuevo';
  }
  this.loading = false; 
}
    });
  }

  getTeamColor(totaLoadDays: number): string {
    if (totaLoadDays <= 0.49) {
      return 'red';
    } else if (totaLoadDays <= 0.99) {
      return '#FFDE21';
    } else if (totaLoadDays <= 7) {
      return 'green';
    } else {
      return 'red';
    }
  }

  onTeamSelect(team: any) {
    if (this.selectedTeam === team) {
      this.selectedTeam = null; 
    } else {
      this.selectedTeam = team; 
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
  // eliminarModulo() {
  //   if (this.selectedTeam !== null) {
  //     const teamSeleccionado = this.getTeamSeleccionado();
  //     this.showDeleteModal = true;
  //   }
  // }
  // confirmDelete() {
  //   if (this.deleteToTeam) {
  //     this.teamService.deleteTeam(this.deleteToTeam.id).subscribe({
  //       next: () => {
  //         this.showMessage('Producto eliminado exitosamente', 'success');
  //         this.loadTeams();
  //         this.selectedTeam = null;
  //         this.closeDeleteModal();
  //       },
  //       error: (error) => {
  //         this.showMessage('Error al eliminar el producto', 'error');
  //         console.error('Error:', error);
  //         this.closeDeleteModal();
  //       }
  //     });
  //   }
  // }
  // closeDeleteModal() {
  //   this.showDeleteModal = false;
  //   this.deleteToTeam = null;
  // }

  // Método para mostrar mensajes
  showMessage(message: string, type: string) {
    this.errorMessage = message;
  }

  getTeamSeleccionado(): any {
    if (this.selectedTeam == null) {
      throw new Error('No hay ningún equipo seleccionado');
    }
    return this.selectedTeam;
  }
}

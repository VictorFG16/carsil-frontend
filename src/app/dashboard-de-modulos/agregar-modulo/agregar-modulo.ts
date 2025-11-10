import { Component } from '@angular/core';
import { Navbar } from '../../dashboard/navbar/navbar';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { NumericOnlyDirective } from '../../directives/numeric-only.directive';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-agregar-modulo',
  imports: [Navbar, FormsModule, CommonModule, NumericOnlyDirective],
  templateUrl: './agregar-modulo.html',
  styleUrl: './agregar-modulo.css',
})
export class AgregarModulo {
  team = {
    name: '',
    description: '',
    numPersons: null as number | null,
  };
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private teamService: TeamService) {}

  volverAlModulo() {
    this.router.navigate(['/dashboard-de-modulos']);
  }

  onSubmit(form: NgForm) {
    this.errorMessage = '';
    this.loading = true;

    const { name, numPersons } = this.team;
   if (!name && (numPersons === null || numPersons <= 0)) {
    this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    this.loading = false;
    return;
  }
  if (!name) {
    this.errorMessage = 'El nombre del equipo es obligatorio.';
    this.loading = false;
    return;
  }
  if (numPersons === null || numPersons <= 0) {
    this.errorMessage = 'El número de personas debe ser mayor a 0.';
    this.loading = false;
    return;
  }
  

  const teamData = {
    name: this.team.name,
    description: this.team.description,
    numPersons: numPersons,
  };

  this.teamService.createTeam(teamData).subscribe({
    next: (response) => {
      this.loading = false;
      this.router.navigate(['/dashboard-de-modulos']);
    },
    error: (err: HttpErrorResponse) => {
      
      let msg = 'Error al crear el módulo. Por favor, inténtelo de nuevo.';
      // Soporta todos los posibles formatos del backend
      if (err.error) {
        if (typeof err.error === 'string') {
          msg = err.error;
        } else if (err.error.message) {
          msg = err.error.message;
        } else if (err.error.mensaje) {
          msg = err.error.mensaje;
        } else if (Array.isArray(err.error.errores)) {
          msg = err.error.errores.join(' | ');
        }
      } else if (err.message) {
        msg = err.message;
      }
      this.errorMessage = msg;
      this.loading = false;
    }
  });
}
}

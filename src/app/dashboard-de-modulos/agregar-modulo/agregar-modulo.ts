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

  // --- Método Auxiliar para manejo de errores simplificado ---
  private getErrorMessage(err: HttpErrorResponse): string {
    const defaultMsg = 'Error al crear el módulo. Por favor, inténtelo de nuevo.';

    if (!err.error) return err.message || defaultMsg;

    const errorBody = err.error;

    if (typeof errorBody === 'string') {
        return errorBody;
    }

    // Prioriza el mensaje de usuario de ApiError (el que envias con 'Tipo de parámetro inválido')
    if (errorBody.message) {
        return errorBody.message;
    }

    // Fallbacks para otros formatos que podrías tener
    if (errorBody.mensaje) {
        return errorBody.mensaje;
    }
    if (Array.isArray(errorBody.errores)) {
        return errorBody.errores.join(' | ');
    }

    // Si es un objeto ApiError pero no tiene 'message', toma el mensaje de desarrollador.
    if (errorBody.developerMessage) {
      return errorBody.developerMessage;
    }

    return defaultMsg;
  }
  // -----------------------------------------------------------------


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

      // Uso del método simplificado:
      this.errorMessage = this.getErrorMessage(err);
      this.loading = false;
    }
  });
}
}

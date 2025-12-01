import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../dashboard/navbar/navbar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { CommonModule } from '@angular/common';
import { NumericOnlyDirective } from '../../directives/numeric-only.directive';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-edit-modulo',
  imports: [Navbar, FormsModule, CommonModule, NumericOnlyDirective],
  templateUrl: './edit-modulo.html',
  styleUrl: './edit-modulo.css',
})
export class EditModulo implements OnInit {
  team = {
    id: 0,
    name: '',
    description: '',
    numPersons: null as number | null,
  };
  errorMessage = '';
  loading = false;
  teamId: number = 0;
  constructor(private router: Router, private teamService: TeamService, private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamId = +params['id'];
      if (this.teamId) {
        this.loadTeam(this.teamId);
      }
      
  });
  }
  loadTeam(id: number) {
    this.loading = true;
    this.teamService.getTeamById(id).subscribe({
      next: (team: any) => {
        this.team = {
          id: team.id,
          name: team.name || '',
          description: team.description || '',
          numPersons: team.numPersons || 0,
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el módulo:', error);
        this.errorMessage = 'Error al cargar el módulo para editar.';
        this.loading = false;
      },
    });
  }
  
 onSubmit(form: NgForm) {
  this.errorMessage = '';

  const { name, numPersons } = this.team;

  
  if (!name && (numPersons === null || numPersons <= 0)) {
    this.errorMessage = 'Por favor, complete todos los campos correctamente.';
    return;
  }
  if (!name) {
    this.errorMessage = 'El nombre del equipo es obligatorio.';
    return;
  }
  if (numPersons === null || numPersons <= 0) {
    this.errorMessage = 'El número de personas debe ser mayor a 0.';
    return;
  }

  const teamData = {
    id: this.team.id,
    name: this.team.name,
    description: this.team.description,
    numPersons: this.team.numPersons
  };

  this.loading = true;
  this.teamService.updateTeam(this.team.id, teamData).subscribe({
    next: () => {
      this.loading = false;
      this.router.navigate(['/dashboard-de-modulos']);
    },
    error: (err: HttpErrorResponse) => {
  console.log('Error recibido en editar:', err, err.error);
  let msg = 'Error al actualizar el módulo. Por favor intente nuevamente.';
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


  volverAlModulo() {
    this.router.navigate(['/dashboard-de-modulos']);
  }
}

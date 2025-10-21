import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../dashboard/navbar/navbar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-edit-modulo',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './edit-modulo.html',
  styleUrl: './edit-modulo.css',
})
export class EditModulo implements OnInit {
  team = {
    id: 0,
    name: '',
    description: '',
    numPersons: 0,
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
    
    // Validar que todos los campos estén completos
    if (!this.team.name || !this.team.numPersons || this.team.numPersons <= 0) {
      this.errorMessage = 'Todos los campos son obligatorios. Por favor complete todos los campos.';
      return;
    }
    
    const teamData = {
      id: this.team.id,
      name:this.team.name,
      description: this.team.description,
      numPersons: this.team.numPersons
    };

    this.loading = true;
    this.teamService.updateTeam(this.team.id, teamData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard-de-modulos']);
      },
      error: (error) => {
        console.error('Error al actualizar el módulo:', error);
        this.errorMessage = 'Error al actualizar el módulo. Por favor intente nuevamente.';
        this.loading = false;
      }
    });
  }


  volverAlModulo() {
    this.router.navigate(['/dashboard-de-modulos']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../dashboard/navbar/navbar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ModuleService } from '../../services/module.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-edit-modulo',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './edit-modulo.html',
  styleUrl: './edit-modulo.css',
})
export class EditModulo implements OnInit {
  module = {
    id: 0,
    name: '',
    description: '',
    numPersons: 0,
  };
  errorMessage = '';
  loading = false;
  moduleId: number = 0;
  constructor(private router: Router, private moduleService: ModuleService, private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.moduleId = +params['id'];
      if (this.moduleId) {
        this.loadModulo(this.moduleId);
      }
      
  });
  }
  loadModulo(id: number) {
    this.loading = true;
    this.moduleService.getModuleById(id).subscribe({
      next: (module: any) => {
        this.module = {
          id: module.id,
          name: module.name || '',
          description: module.description || '',
          numPersons: module.numPersons || 0,
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
    if (!this.module.name || !this.module.numPersons || this.module.numPersons <= 0) {
      this.errorMessage = 'Todos los campos son obligatorios. Por favor complete todos los campos.';
      return;
    }
    
    const moduleData = {
      id: this.module.id,
      name:this.module.name,
      description: this.module.description,
      numPersons: this.module.numPersons
    };

    this.loading = true;
    this.moduleService.updateModule(this.module.id, moduleData).subscribe({
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

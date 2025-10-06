import { Component } from '@angular/core';
import { Navbar } from "../../dashboard/navbar/navbar";
import { FormsModule , NgForm} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-agregar-modulo',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './agregar-modulo.html',
  styleUrl: './agregar-modulo.css'
})
export class AgregarModulo {
  module = {
    name: '',
    description: '',
    numPersons: 0,
  };
errorMessage = '';
loading = false;

  constructor (private router: Router,
    private moduleService: ModuleService
  ){}
    
  

volverAlModulo() {
this.router.navigate (['/dashboard-de-modulos'])
}


onSubmit(form: NgForm) {
this.errorMessage = '';
this.loading = true;

if (!this.module.name || this.module.numPersons <= 0) {
  this.errorMessage = 'Por favor, complete todos los campos correctamente.';
  this.loading = false;
  return;
}
 const moduleData = {
   name: this.module.name,
   description: this.module.description,
   numPersons: this.module.numPersons,
};
 this.moduleService.createModule(moduleData).subscribe({
   next: (response) => {
     console.log('Módulo creado con éxito:', response);
     this.loading = false;
     this.router.navigate(['/dashboard-de-modulos']);
   },
   error: (error) => {
     console.error('Error al crear el módulo:', error);
     this.errorMessage = 'Error al crear el módulo. Por favor, inténtelo de nuevo.';
     this.loading = false;
   }
 });

}
}

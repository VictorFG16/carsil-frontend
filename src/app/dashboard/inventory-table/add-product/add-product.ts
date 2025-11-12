import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../../services/date-utils.service';
import { TeamService, Team } from '../../../services/team.service';
import { NumericOnlyDirective } from '../../../directives/numeric-only.directive';
import { firstValueFrom} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
selector: 'app-add-product',
imports: [FormsModule, Navbar, CommonModule,NumericOnlyDirective],
templateUrl: './add-product.html',
styleUrl: './add-product.css'
})
export class AddProduct implements OnInit {
brands : { key: string, label: string }[] = []
product = {
description: '',
price: null as number | null,
quantity: 0,
fechaAsignada: '',
fechaEntrada: '',
referencia: '',
marca: null as string | null,
op: '',
camp: '',
tipo: '',
talla: '',
team: null as Team | null,
sam: null as number | null
};
errorMessage = '';


teams: Team[] = [];
showTeamModal = false;


showSizeModal = false;
activeSizeSection: 'kids' | 'adult' = 'kids';


kidsSizes: { name: string, quantity: number | null }[] = [];
adultSizes: { name: string, quantity: number | null }[] = [];

async loadEnums() {
    try {

      const res = await firstValueFrom(this.productService.getAllEnums());
      this.brands = res.brands.map((b: Record<string, string>) => {
        const [key, label] = Object.entries(b)[0];
        return { key, label };
      });


      const sizes = res.sizes.map((s: Record<string, string>) => {
        const [key, label] = Object.entries(s)[0];
        return { key, label };
      });

      this.kidsSizes = sizes.filter((s: { key: string, label: string }) => !isNaN(Number(s.label))).map((s: { key: string, label: string }) => ({ name: s.label, quantity: null }));
      this.adultSizes = sizes.filter((s: { key: string, label: string }) => isNaN(Number(s.label))).map((s: { key: string, label: string }) => ({ name: s.label, quantity: null }));

    } catch (error) {
      console.error('Error loading enums:', error);
    }
  }

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly dateUtils: DateUtilsService,
    private readonly teamService: TeamService,
  ) {}

  ngOnInit() {
    this.loadTeams();
    this.loadEnums();
  }


  loadTeams() {
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
      }
    });
  }

  openTeamModal() {
    this.showTeamModal = true;
  }

  closeTeamModal() {
    this.showTeamModal = false;
  }

  selectTeam(mod: Team) {
    this.product.team = mod;
    this.closeTeamModal();
  }

  // Abrir modal de tallas
  openSizeModal() {
    this.showSizeModal = true;
    this.activeSizeSection = 'kids';
  }

  closeSizeModal() {
    this.showSizeModal = false;
  }

  showAdultSizes() {
    this.activeSizeSection = 'adult';
  }

  showKidsSizes() {
    this.activeSizeSection = 'kids';
  }


  saveSizes() {

  const combinedSizes = [...this.kidsSizes, ...this.adultSizes];
  const selectedSizes = combinedSizes.filter(size => size.quantity && size.quantity > 0);


  if (selectedSizes.length === 0) {
    this.product.talla = '';
    this.product.quantity = 0;
  } else {

    this.product.quantity = selectedSizes.reduce((total, size) => total + (size.quantity || 0), 0);

    this.product.talla = JSON.stringify(selectedSizes);
  }


  this.closeSizeModal();
}

  onSubmit(form: NgForm) {
    this.errorMessage = '';




    // Construir objeto sizeQuantities
    const sizeQuantities: { [key: string]: number } = {};
    this.kidsSizes.forEach(size => {
      if (size.quantity && size.quantity > 0) {
        sizeQuantities[size.name] = size.quantity;
      }
    });
    this.adultSizes.forEach(size => {
      if (size.quantity && size.quantity > 0) {
        sizeQuantities[size.name] = size.quantity;
      }
    });

    const productData = {
      description: this.product.description,
      price: this.product.price,
      quantity: this.product.quantity,
      assignedDate: this.dateUtils.formatDateForBackend(this.product.fechaAsignada),
      plantEntryDate: this.dateUtils.formatDateForBackend(this.product.fechaEntrada),
      reference: this.product.referencia,
      brand: this.product.marca,
      op: this.product.op,
      campaign: this.product.camp,
      type: this.product.tipo,
      sizeQuantities: sizeQuantities,
      size: '',
      team: this.product.team,
      sam: this.product.sam
    };

    this.productService.createProduct(productData).subscribe({
      next: (response) => {
        console.log('Producto agregado:', response);
        this.router.navigate(['/dashboard']);
      },

      error: (err: HttpErrorResponse) => {
        console.error('Error al agregar producto:', err);

        let msg = 'Error desconocido al agregar el producto. Por favor, inténtelo de nuevo.';

        // Soporta todos los posibles formatos del backend (similar a agregar-modulo.ts)
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.message) {
            msg = err.error.message;
          } else if (err.error.mensaje) {
            msg = err.error.mensaje;
          } else if (Array.isArray(err.error.errores)) {
            msg = err.error.errores.join(' | ');
          } else if (err.error.developerMessage) { // Si es un objeto ApiError, toma el mensaje de usuario
            msg = err.error.message || err.error.developerMessage;
          }
        } else if (err.message) {
          msg = err.message;
        }
        this.errorMessage = msg;
      }
    });
  }
  // Limpiar todas las tallas
clearSizes() {
  this.kidsSizes.forEach(size => size.quantity = null);
  this.adultSizes.forEach(size => size.quantity = null);
  this.product.talla = '';
  this.product.quantity = 0;
}
  // Método para verificar si hay tallas seleccionadas
hasSizesSelected(): boolean {
  return !!this.product.talla && this.product.talla.length > 0;
}

// Método para verificar si hay equipo seleccionado
hasTeamSelected(): boolean {
  return !!this.product.team;
}

  volverAlInventario() {
    this.router.navigate(['/dashboard']);
  }
}

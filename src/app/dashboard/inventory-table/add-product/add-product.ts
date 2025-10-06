import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../../services/date-utils.service';
import { ModuleService, Module } from '../../../services/module.service';
import { NumericOnlyDirective } from '../../../directives/numeric-only.directive';



@Component({
  selector: 'app-add-product',
  imports: [FormsModule, Navbar, CommonModule,NumericOnlyDirective],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProduct implements OnInit {
  product = {
    description: '',
    price: null as number | null,
    quantity: 0,
    fechaAsignada: '',
    fechaEntrada: '',
    referencia: '',
    marca: '',
    op: '',
    camp: '',
    tipo: '',
    talla: '',
    module: null as Module | null,
    sam: null as number | null
  };
  errorMessage = '';

  // Lista de módulos disponibles
  modules: Module[] = [];
  showModuleModal = false;

  // Modal de tallas
  showSizeModal = false;
  activeSizeSection: 'kids' | 'adult' = 'kids';

  // Tallas para niños (inicializadas con null en lugar de 0)
  kidsSizes = [
    { name: '2', quantity: null as number | null },
    { name: '4', quantity: null as number | null },
    { name: '6', quantity: null as number | null },
    { name: '8', quantity: null as number | null },
    { name: '10', quantity: null as number | null },
    { name: '12', quantity: null as number | null },
    { name: '16', quantity: null as number | null }
  ];

  // Tallas para adultos (inicializadas con null en lugar de 0)
  adultSizes = [
    { name: 'XS', quantity: null as number | null },
    { name: 'S', quantity: null as number | null },
    { name: 'M', quantity: null as number | null },
    { name: 'L', quantity: null as number | null },
    { name: 'XL', quantity: null as number | null },
    { name: 'XXL', quantity: null as number | null }
  ];

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly dateUtils: DateUtilsService,
    private readonly moduleService: ModuleService
  ) {}

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
      }
    });
  }

  openModuleModal() {
    this.showModuleModal = true;
  }

  closeModuleModal() {
    this.showModuleModal = false;
  }

  selectModule(mod: Module) {
    this.product.module = mod;
    this.closeModuleModal();
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

  // Guardar tallas seleccionadas
  saveSizes() {
  // Combinar tallas de niños y adultos
  const combinedSizes = [...this.kidsSizes, ...this.adultSizes];
  // Filtrar solo tallas con cantidad válida (>0)
  const selectedSizes = combinedSizes.filter(size => size.quantity && size.quantity > 0);

  // Si NO hay tallas seleccionadas, limpiar todo
  if (selectedSizes.length === 0) {
    this.product.talla = '';
    this.product.quantity = 0;
  } else {
    // Calcular el total de cantidades
    this.product.quantity = selectedSizes.reduce((total, size) => total + (size.quantity || 0), 0);
    // Guardar tallas como JSON
    this.product.talla = JSON.stringify(selectedSizes);
  }

  // Cerrar modal
  this.closeSizeModal();
}

  onSubmit(form: NgForm) {
    this.errorMessage = '';

    // Validar que todos los campos estén completos
    if (!this.product.referencia || !this.product.fechaAsignada ||
        !this.product.fechaEntrada || !this.product.marca || !this.product.op ||
        !this.product.camp || !this.product.tipo || !this.product.talla || this.product.module == null ||
        !this.product.quantity || !this.product.price || !this.product.sam || this.product.sam <= 0) {
      this.errorMessage = 'Todos los campos son obligatorios. Por favor complete todos los campos.';
      return;
    }

    // Validar fechas
    if (!this.dateUtils.isValidDate(this.product.fechaAsignada) ||
        !this.dateUtils.isValidDate(this.product.fechaEntrada)) {
      this.errorMessage = 'Las fechas ingresadas no son válidas.';
      return;
    }

    const fechaAsignadaDate = new Date(this.product.fechaAsignada);
    const fechaEntradaDate = new Date(this.product.fechaEntrada);
    if (fechaEntradaDate < fechaAsignadaDate) {
      this.errorMessage = 'La fecha de entrada no puede ser menor que la fecha asignada.';
      return;
    }

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
      module: this.product.module,
      sam: this.product.sam
    };

    this.productService.createProduct(productData).subscribe({
      next: (response) => {
        console.log('Producto agregado:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
        this.errorMessage = 'Error al agregar el producto. Por favor intente nuevamente.';
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
hasModuleSelected(): boolean {
  return !!this.product.module;
}

  volverAlInventario() {
    this.router.navigate(['/dashboard']);
  }
}

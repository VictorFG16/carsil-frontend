import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../../services/date-utils.service';
import { ModuleService, Module } from '../../../services/module.service';

@Component({
  selector: 'app-add-product',
  imports: [FormsModule, Navbar, CommonModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProduct implements OnInit {
  product = {
    description: '',
    price: 0,
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
    sam: 0
  };
  errorMessage = '';

  // Lista de módulos disponibles
  modules: Module[] = [];
  showModuleModal = false;

  // Nuevas propiedades para el modal de tallas
  showSizeModal = false;
  activeSizeSection: 'kids' | 'adult' = 'kids';

  // Tallas para niños
  kidsSizes = [
    { name: '2', quantity: 0 },
    { name: '4', quantity: 0 },
    { name: '6', quantity: 0 },
    { name: '8', quantity: 0 },
    { name: '10', quantity: 0 },
    { name: '12', quantity: 0 },
    { name: '16', quantity: 0 }
  ];

  // Tallas para adultos
  adultSizes = [
    { name: 'XS', quantity: 0 },
    { name: 'S', quantity: 0 },
    { name: 'M', quantity: 0 },
    { name: 'L', quantity: 0 },
    { name: 'XL', quantity: 0 },
    { name: 'XXL', quantity: 0 }
  ];

  sizes = [
    { name: 'XS', quantity: 0 },
    { name: 'S', quantity: 0 },
    { name: 'M', quantity: 0 },
    { name: 'L', quantity: 0 },
    { name: 'XL', quantity: 0 },
    { name: 'XXL', quantity: 0 },
    { name: 'XXXL', quantity: 0 }
  ];

  constructor(
    private  readonly productService: ProductService,
    private  readonly router: Router,
    private  readonly dateUtils: DateUtilsService,
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

  // Método para abrir el modal de tallas
  openSizeModal() {
    this.showSizeModal = true;
    this.activeSizeSection = 'kids'; // Mostrar sección de niños por defecto
  }

  // Método para cerrar el modal
  closeSizeModal() {
    this.showSizeModal = false;
  }

  // Cambiar a sección de tallas de adultos
  showAdultSizes() {
    this.activeSizeSection = 'adult';
  }

  // Cambiar a sección de tallas de niños
  showKidsSizes() {
    this.activeSizeSection = 'kids';
  }

  // Método para guardar las tallas seleccionadas
  saveSizes() {
    // Combinar tallas de niños y adultos
    const combinedSizes = [...this.kidsSizes, ...this.adultSizes];
    // Filtrar tallas con cantidad > 0
    const selectedSizes = combinedSizes.filter(size => size.quantity > 0);

    // Calcular total quantity
    this.product.quantity = selectedSizes.reduce((total, size) => total + size.quantity, 0);

    // Serializar tallas en JSON para el campo talla
    this.product.talla = JSON.stringify(selectedSizes);

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

    // Validar que las fechas sean válidas
    if (!this.dateUtils.isValidDate(this.product.fechaAsignada) ||
        !this.dateUtils.isValidDate(this.product.fechaEntrada)) {
      this.errorMessage = 'Las fechas ingresadas no son válidas.';
      return;
    }

    // Validar que fechaEntrada no sea menor que fechaAsignada
    const fechaAsignadaDate = new Date(this.product.fechaAsignada);
    const fechaEntradaDate = new Date(this.product.fechaEntrada);
    // fechaEntrada debe ser igual o mayor que fechaAsignada
    if (fechaEntradaDate < fechaAsignadaDate) {
      this.errorMessage = 'La fecha de entrada no puede ser menor que la fecha asignada.';
      return;
    }

    // Construir sizeQuantities combinando kidsSizes y adultSizes
    const sizeQuantities: {[key: string]: number} = {};
    this.kidsSizes.forEach(size => {
      if (size.quantity > 0) {
        sizeQuantities[size.name] = size.quantity;
      }
    });
    this.adultSizes.forEach(size => {
      if (size.quantity > 0) {
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
      size: '', // campo size puede quedar vacío o eliminarse si backend lo permite
      module: this.product.module, // enviar el módulo seleccionado o creado
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

  volverAlInventario() {
    this.router.navigate(['/dashboard']);
  }

}

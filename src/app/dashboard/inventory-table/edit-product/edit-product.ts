import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DateUtilsService } from '../../../services/date-utils.service';
import { ModuleService, Module } from '../../../services/module.service';
import { Navbar } from '../../navbar/navbar';

@Component({
  selector: 'app-edit-product',
  standalone: true, 
  imports: [FormsModule, CommonModule, Navbar],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css'] 
})
export class EditProduct implements OnInit {
  product = {
    id: 0,
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
    stoppageReason: '',
    status: '',
    actualDeliveryDate: '',
    sam: 0,
    quantityMade: 0
  };
  errorMessage = '';
  loading = false;
  productId: number = 0;

  modules: Module[] = [];

  stoppageReasons: string[] = [
    'MARQUILLA TALLA',
    'COMPOSICION',
    'CODIGO',
    'FALTANTE DE PIEZA',
    'BOLSAS',
    'FALTA TODO',
    'OK',
    'FICHA',
    'SESGO'
  ];
  status: string[] = [
    'PROCESO',
    'ASIGNADO',
    'CONFECCION'

  ]
  showSizeModal = false;
  activeSizeSection: 'kids' | 'adult' = 'kids';
  showModuleModal = false;

  kidsSizes = [
    { name: '2', quantity: 0 },
    { name: '4', quantity: 0 },
    { name: '6', quantity: 0 },
    { name: '8', quantity: 0 },
    { name: '10', quantity: 0 },
    { name: '12', quantity: 0 },
    { name: '16', quantity: 0 }
  ];

  adultSizes = [
    { name: 'XS', quantity: 0 },
    { name: 'S', quantity: 0 },
    { name: 'M', quantity: 0 },
    { name: 'L', quantity: 0 },
    { name: 'XL', quantity: 0 },
    { name: 'XXL', quantity: 0 },
  ];

  constructor(
    private  readonly productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private dateUtils: DateUtilsService,
    private moduleService: ModuleService
  ) {}

  async ngOnInit() {
    await this.loadModules();
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });
  }

  loadModules(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.moduleService.getAllModules().subscribe({
        next: (modules) => {
          this.modules = modules;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar módulos:', error);
          reject(error);
        }
      });
    });
  }

  getModuleName(): string {
    return this.product.module ? this.product.module.name : '';
  }

  openSizeModal() {
    this.showSizeModal = true;
    this.activeSizeSection = 'kids';
    const hasKidsSizes = this.kidsSizes.some(s => s.quantity > 0);
    const hasAdultSizes = this.adultSizes.some(s => s.quantity > 0);
    if (hasAdultSizes && !hasKidsSizes) {
      this.activeSizeSection = 'adult';
    }
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
    const selectedSizes = combinedSizes.filter(size => size.quantity > 0);
    this.product.quantity = selectedSizes.reduce((total, size) => total + size.quantity, 0);
    this.product.talla = JSON.stringify(selectedSizes);
    this.closeSizeModal();
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

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.product = {
          id: product.id,
          description: product.description || '',
          price: product.price || 0,
          quantity: product.quantity || 0,
          fechaAsignada: this.dateUtils.formatDateForBackend(product.assignedDate),
          fechaEntrada: this.dateUtils.formatDateForBackend(product.plantEntryDate),
          referencia: product.reference || '',
          marca: product.brand || '',
          op: product.op || '',
          camp: product.campaign || '',
          tipo: product.type || '',
          talla: '',
          module: null,
          stoppageReason: product.stoppageReason || '',
          status: product.status || '',
          actualDeliveryDate: this.dateUtils.formatDateForBackend(product.actualDeliveryDate),
          sam: product.sam || 0,
          quantityMade: product.quantityMade || 0
        };

        if (product.module && product.module.id) {
          const matchedModule = this.modules.find(m => m.id === product.module.id);
          if (matchedModule) {
            this.product.module = matchedModule;
          }
        }

        if (product.sizeQuantities && typeof product.sizeQuantities === 'object') {
          const sizeArray = Object.entries(product.sizeQuantities).map(([name, quantity]) => ({
            name,
            quantity: quantity as number
          }));
          this.loadSizesFromData(sizeArray);
        }

        if (product.talla && typeof product.talla === 'string') {
          try {
            const sizeData = JSON.parse(product.talla);
            this.loadSizesFromData(sizeData);
          } catch (e) {
            console.warn('Error parsing size data:', e);
          }
        }

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar el producto:', error);
        this.errorMessage = 'Error al cargar el producto para editar.';
        this.loading = false;
      }
    });
  }

  loadSizesFromData(sizeData: any[]) {
    this.kidsSizes.forEach(size => size.quantity = 0);
    this.adultSizes.forEach(size => size.quantity = 0);
    sizeData.forEach((size: any) => {
      const kidsSize = this.kidsSizes.find(s => s.name === size.name);
      const adultSize = this.adultSizes.find(s => s.name === size.name);
      if (kidsSize) kidsSize.quantity = size.quantity ?? 0;
      if (adultSize) adultSize.quantity = size.quantity ?? 0;
    });
    this.updateSizeButtonText();
  }

  updateSizeButtonText() {
    const hasSizes = this.kidsSizes.some(s => s.quantity > 0) || this.adultSizes.some(s => s.quantity > 0);
    if (hasSizes) {
      const selectedSizes = [...this.kidsSizes, ...this.adultSizes].filter(s => s.quantity > 0);
      this.product.talla = JSON.stringify(selectedSizes);
    } else {
      this.product.talla = '';
    }
  }

  onSubmit(form: NgForm) {
    this.errorMessage = '';

    if (!this.product.referencia || !this.product.fechaAsignada ||
        !this.product.fechaEntrada || !this.product.marca || !this.product.op ||
        !this.product.camp || !this.product.tipo ||
        !this.product.quantity || !this.product.price || !this.product.module ||
        !this.product.sam || this.product.sam <= 0) {
      this.errorMessage = 'Todos los campos son obligatorios. Por favor complete todos los campos.';
      return;
    }

    const hasSizes = this.kidsSizes.some(s => s.quantity > 0) || this.adultSizes.some(s => s.quantity > 0);
    if (!hasSizes) {
      this.errorMessage = 'Debe seleccionar al menos una talla.';
      return;
    }

    if (!this.dateUtils.isValidDate(this.product.fechaAsignada) ||
        !this.dateUtils.isValidDate(this.product.fechaEntrada)) {
      this.errorMessage = 'Las fechas ingresadas no son válidas.';
      return;
    }

    const sizeQuantities: { [key: string]: number } = {};
    this.kidsSizes.forEach(size => {
      if (size.quantity > 0) sizeQuantities[size.name] = size.quantity;
    });
    this.adultSizes.forEach(size => {
      if (size.quantity > 0) sizeQuantities[size.name] = size.quantity;
    });

    const productData = {
      id: this.product.id,
      description: this.product.description === '' ? null : this.product.description,
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
      stoppageReason: this.product.stoppageReason === '' ? null : this.product.stoppageReason,
      status: this.product.status === '' ? null : this.product.status,
      actualDeliveryDate: this.dateUtils.formatDateForBackend(this.product.actualDeliveryDate),
      sam: this.product.sam,
      quantityMade: this.product.quantityMade

    };

    this.loading = true;
    this.productService.updateProduct(this.product.id, productData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Error al actualizar el producto. Por favor intente nuevamente.';
        this.loading = false;
      }
    });
  }

  volverAlInventario() {
    this.router.navigate(['/dashboard']);
  }

  getSelectedSizesCount(): number {
    return this.kidsSizes.filter(s => s.quantity > 0).length +
           this.adultSizes.filter(s => s.quantity > 0).length;
  }
}

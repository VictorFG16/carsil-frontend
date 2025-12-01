import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule} from '@angular/common';
import { DateUtilsService } from '../../../services/date-utils.service';
import { TeamService, Team } from '../../../services/team.service';
import { Navbar } from '../../navbar/navbar';
import { NumericOnlyDirective } from '../../../directives/numeric-only.directive';

@Component({
  selector: 'app-edit-product',
  standalone: true, 
  imports: [FormsModule, CommonModule, Navbar , NumericOnlyDirective],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css'] ,
})
export class EditProduct implements OnInit {
  brands: { key: string, label: string }[] = [];
  stoppageReasons : { key: string, label: string }[] = [];
  productionStatus : { key: string, label: string }[] = [];
  product = {
    id: 0,
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
    team: null as Team | null,
    stoppageReason: null as string | null,
    status: null as string | null,
    actualDeliveryDate: '',
    sam: null as number | null,
    quantityMade: null as number | null
  };
  errorMessage = '';
  loading = false;
  productId: number = 0;
  teams: Team[] = [];
  showSizeModal = false;
  activeSizeSection: 'kids' | 'adult' = 'kids';
  showTeamModal = false;

  kidsSizes: { name: string, quantity: number | null }[] = [];
  adultSizes: { name: string, quantity: number | null }[] = [];

  async loadEnums() {
  try {
    const res = await firstValueFrom(this.productService.getAllEnums());
    
    this.brands = res.brands.map((b: Record<string, string>) => {
      const [key, label] = Object.entries(b)[0];
      return { key, label };
    });

    
    this.stoppageReasons = res.stoppageReasons.map((s: Record<string, string>) => {
      const [key, label] = Object.entries(s)[0];
      return { key, label };
    });

    
    this.productionStatus   = res.productionStatus.map((s: Record<string, string>) => {
      const [key, label] = Object.entries(s)[0];
      return { key, label };
    });

  
    const sizes = res.sizes.map((s: Record<string, string>) => {
      const [key, label] = Object.entries(s)[0];
      return { key, label };
    });

    
    this.kidsSizes = sizes.filter((s: { key: string, label: string }) => !isNaN(Number(s.label))).map((s: { key: string, label: string }) => ({ name: s.label, quantity: null }));
    this.adultSizes = sizes.filter((s: { key: string, label: string }) => isNaN(Number(s.label))).map((s: { key: string, label: string }) => ({ name: s.label, quantity: null }));

  } catch (err) {
    console.error('Error al cargar enums:', err);
  }
}

  constructor(
    private readonly productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private dateUtils: DateUtilsService,
    private teamService: TeamService
  ) {}

  async ngOnInit() {
    await this.loadEnums();
    await this.loadTeams();

    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });
  }


  loadTeams(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.teamService.getAllTeams().subscribe({
        next: (teams) => {
          this.teams = teams;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar equipos:', error);
          reject(error);
        }
      });
    });
  }

  getTeamName(): string {
    return this.product.team ? this.product.team.name : '';
  }

  openSizeModal() {
    this.showSizeModal = true;
    this.activeSizeSection = 'kids';
    const hasKidsSizes = this.kidsSizes.some(s => (s.quantity ?? 0) > 0);
    const hasAdultSizes = this.adultSizes.some(s => (s.quantity ?? 0) > 0);
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
    const selectedSizes = combinedSizes.filter(size => size.quantity && size.quantity > 0);
    this.product.quantity = selectedSizes.reduce((total, size) => total + (size.quantity || 0), 0);
    this.product.talla = JSON.stringify(selectedSizes);
    this.closeSizeModal();
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

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: 
      
      (product: any) => {
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
          team: product.team || null,
          stoppageReason: product.stoppageReason || null,
          status: product.status || null,
          actualDeliveryDate: this.dateUtils.formatDateForBackend(product.actualDeliveryDate),
          sam: product.sam || 0,
          quantityMade: product.quantityMade || 0
        };
        if (product.Team && product.Team.id) {
          const matchedTeam = this.teams.find(m => m.id === product.Team.id);
          if (matchedTeam) {
            this.product.team = matchedTeam;
          }
        }

        if (product.sizeQuantities && typeof product.sizeQuantities === 'object') {
          const sizeArray = Object.entries(product.sizeQuantities).map(([name, quantity]) => ({
            name,
            quantity: (quantity as number) ?? null
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
        this.errorMessage = 'Error al cargar el producto para editar.';
        this.loading = false;
      }
      
    });

  }

  loadSizesFromData(sizeData: any[]) {
    this.kidsSizes.forEach(size => size.quantity = null);
    this.adultSizes.forEach(size => size.quantity = null);
    sizeData.forEach((size: any) => {
      const kidsSize = this.kidsSizes.find(s => s.name === size.name);
      const adultSize = this.adultSizes.find(s => s.name === size.name);
      if (kidsSize) kidsSize.quantity = size.quantity ?? null;
      if (adultSize) adultSize.quantity = size.quantity ?? null;
    });
    this.updateSizeButtonText();
  }

  updateSizeButtonText() {
    const hasSizes = this.kidsSizes.some(s => (s.quantity ?? 0) > 0) || this.adultSizes.some(s => (s.quantity ?? 0) > 0);
    if (hasSizes) {
      const selectedSizes = [...this.kidsSizes, ...this.adultSizes].filter(s => (s.quantity ?? 0) > 0);
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
        !this.product.quantity || !this.product.price || !this.product.team ||
        !this.product.sam || this.product.sam <= 0) {
      this.errorMessage = 'Todos los campos son obligatorios. Por favor complete todos los campos.';
      return;
    }

    const hasSizes = this.kidsSizes.some(s => (s.quantity ?? 0) > 0) || this.adultSizes.some(s => (s.quantity ?? 0) > 0);
    if (!hasSizes) {
      this.errorMessage = 'Debe seleccionar al menos una talla.';
      return;
    }

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

    
    if (this.product.actualDeliveryDate) {
      const actualDeliveryDate = new Date(this.product.actualDeliveryDate);
      if (actualDeliveryDate < fechaAsignadaDate) {
        this.errorMessage = 'La fecha de entrega real no puede ser menor que la fecha asignada.';
        return;
      }
    }
    
    
    const sizeQuantities: { [key: string]: number } = {};
    this.kidsSizes.forEach(size => {
      if (size.quantity && size.quantity > 0) sizeQuantities[size.name] = size.quantity;
    });
    this.adultSizes.forEach(size => {
      if (size.quantity && size.quantity > 0) sizeQuantities[size.name] = size.quantity;
    });

    const productData = {
      id: this.product.id,
      description: this.product.description ,
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
  // Limpiar todas las tallas
clearSizes() {
  this.kidsSizes.forEach(size => size.quantity = null);
  this.adultSizes.forEach(size => size.quantity = null);
  this.product.talla = '';
  this.product.quantity = 0;
  
}
  hasSizesSelected(): boolean {
  return !!this.product.talla && this.product.talla.length > 0;
}

 hasTeamSelected(): boolean {
    return !!this.product.team;
  }
  volverAlInventario() {
    this.router.navigate(['/dashboard']);
  }

  getSelectedSizesCount(): number {
    return this.kidsSizes.filter(s => (s.quantity ?? 0) > 0).length +
           this.adultSizes.filter(s => (s.quantity ?? 0) > 0).length;
  }
}

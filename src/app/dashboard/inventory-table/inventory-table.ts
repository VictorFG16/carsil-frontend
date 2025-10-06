import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { FormsModule } from '@angular/forms';
import { ModuleService } from '../../services/module.service';


declare var bootstrap: any; 

@Component({
  selector: 'app-inventory-table',
  imports: [CommonModule, FormsModule ],
  templateUrl: './inventory-table.html',
  styleUrls: ['./inventory-table.css']
})
export class InventoryTable implements OnInit, AfterViewInit {
  inventory: any[] = [];
  loading = true;
  error = '';
  paginaActual = 1;
  showAddProductForm = false;
  itemsPorPagina = 10;
  totalRegistros = 0;
  selectedRow: number | null = null;
  searchTerm = '';
  isSearching = false;
  showDeleteModal = false;
  productToDelete: any = null;
  errorMessage = '';
  private tooltipList: any[] = [];

  constructor(
    private productService: ProductService, 
    private router: Router, 
    private dateUtils: DateUtilsService, 
    moduleService: ModuleService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngAfterViewInit() {
    
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }

  initializeTooltips() {
    // Destruir TODOS los tooltips anteriores
    this.tooltipList.forEach(tooltip => {
      try {
        tooltip.dispose();
      } catch (e) {
        
      }
    });
    this.tooltipList = [];

   
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());

    
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    this.tooltipList = tooltipTriggerList.map((tooltipTriggerEl: any) => {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover',
        html: true
      });
    });
  }

  loadProducts() {
    this.loading = true;
    this.isSearching = false;
    this.searchTerm = '';
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.inventory = products.map((product: any) => ({
          id: product.id,
          fechaAsignada: this.dateUtils.formatDateForDisplay(product.assignedDate),
          fechaEntrada: this.dateUtils.formatDateForDisplay(product.plantEntryDate),
          referencia: product.reference,
          marca: product.brand,
          op: product.op,
          camp: product.campaign,
          tipo: product.type,
          modulo: product.module,
          descripcion: product.description,
          price: product.price,
          total: product.quantity
        }));
        
        this.inventory.sort((a, b) => b.id - a.id);
        this.totalRegistros = this.inventory.length;
        this.loading = false;
        
        
        setTimeout(() => {
          this.initializeTooltips();
        }, 100);
      },
      error: (error) => {
        this.error = 'Error al cargar los productos', error;
        this.loading = false;
      }
    });
  }

  searchProducts() {
    if (!this.searchTerm.trim()) {
      this.loadProducts();
      return;
    }

    this.isSearching = true;
    this.productService.searchProducts(this.searchTerm).subscribe({
      next: (products) => {
        this.inventory = products.map((product: any) => ({
          id: product.id,
          fechaAsignada: this.dateUtils.formatDateForDisplay(product.assignedDate),
          fechaEntrada: this.dateUtils.formatDateForDisplay(product.plantEntryDate),
          referencia: product.reference,
          marca: product.brand,
          op: product.op,
          camp: product.campaign,
          tipo: product.type,
          modulo: product.module,
          descripcion: product.description,
          price: product.price,
          total: product.quantity
        }));

        this.inventory.sort((a, b) => b.id - a.id);
        this.totalRegistros = this.inventory.length;
        this.loading = false;
        this.paginaActual = 1;
        
       
        setTimeout(() => {
          this.initializeTooltips();
        }, 100);
      },
      error: (error) => {
        this.error = 'Error al buscar productos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadProducts();
  }

  
 get productosPaginados() {
  const inicio = (this.paginaActual - 1) * Number(this.itemsPorPagina);
  const fin = inicio + Number(this.itemsPorPagina);
  return this.inventory.slice(inicio, fin);
}

  get totalPaginas() {
    return Math.ceil(this.totalRegistros / this.itemsPorPagina);
  }

  get paginas() {
  const paginas = [];
  const maxPaginasVisibles = 3;
  
  if (this.totalPaginas <= maxPaginasVisibles) {
    
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
  } else {
    
    let inicio = Math.max(1, this.paginaActual - 1);
    let fin = Math.min(this.totalPaginas, inicio + 2);
    
    
    if (fin === this.totalPaginas) {
      inicio = Math.max(1, fin - 2);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
  }
  
  return paginas;
}

  get mostrandoDesde() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.totalRegistros > 0 ? inicio + 1 : 0;
  }

  get mostrandoHasta() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = Math.min(inicio + this.itemsPorPagina, this.totalRegistros);
    return fin;
  }

  
  get opcionesRegistros() {
    return [10, 20, 30];
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  agregar() {
    this.router.navigate(['/add-product']);
  }

  onProductAdded() {
    this.showAddProductForm = false;
    this.loadProducts();
  }

  onCancel() {
    this.showAddProductForm = false;
  }

  
  isAnyRowSelected(): boolean {
    return this.selectedRow !== null;
  }

  cambiarRegistrosPorPagina(nuevoValor: number) {
  this.itemsPorPagina = Number(nuevoValor); 
  this.paginaActual = 1;
  this.selectedRow = null;
  
  setTimeout(() => {
    this.initializeTooltips();
  }, 100);
}


private updatePagination() {
  
}

  
  editarFila() {
    if (this.selectedRow !== null) {
      const filaSeleccionada = this.getFilaSeleccionada();
      this.router.navigate(['/edit-product', filaSeleccionada.id]);
    }
  }

  eliminarFila() {
    if (this.selectedRow !== null) {
      const filaSeleccionada = this.productosPaginados[this.selectedRow];
      this.productToDelete = filaSeleccionada;
      this.showDeleteModal = true;
    }
  }

  confirmDelete() {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe({
        next: () => {
          this.showMessage('Producto eliminado exitosamente', 'success');
          this.loadProducts();
          this.selectedRow = null;
          this.closeDeleteModal();
        },
        error: (error) => {
          this.showMessage('Error al eliminar el producto', 'error');
          console.error('Error:', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  // Método para mostrar mensajes
  showMessage(message: string, type: string) {
    this.errorMessage = message;
  }

  
  getFilaSeleccionada() {
    if (this.selectedRow !== null) {
      return this.productosPaginados[this.selectedRow];
    }
    return null;
  }

  anterior() {
  if (this.paginaActual > 1) {
    this.paginaActual--;
    this.selectedRow = null;
    
    
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }
}

siguiente() {
  if (this.paginaActual < this.totalPaginas) {
    this.paginaActual++;
    this.selectedRow = null;
    
    
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }
}

irAPagina(numero: number) {
  if (numero >= 1 && numero <= this.totalPaginas) {
    this.paginaActual = numero;
    this.selectedRow = null;
    
    
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }
}


  
  selectRow(rowIndex: number, event: MouseEvent) {
    event.stopPropagation();
    
    if (this.selectedRow === rowIndex) {
      this.selectedRow = null;
    } else {
      this.selectedRow = rowIndex;
    }
    
    
    this.destroyAllTooltips();
    
    
    setTimeout(() => {
      this.initializeTooltips();
    }, 50);
  }

 
  private destroyAllTooltips() {
   
    this.tooltipList.forEach(tooltip => {
      try {
        tooltip.hide();
        tooltip.dispose();
      } catch (e) {
        
      }
    });
    this.tooltipList = [];

    
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
  }

  
  isRowSelected(rowIndex: number): boolean {
    return this.selectedRow === rowIndex;
  }
}
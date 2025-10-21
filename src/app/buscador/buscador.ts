import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { ProductService, Product } from '../services/product.service';
import { Navbar } from "../dashboard/navbar/navbar";
import { generateProductPdf } from './pdf-export-helper';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './buscador.html',
  styleUrl: './buscador.css'
})
export class Buscador implements OnInit, OnDestroy {
  searchOp: number | null = null; // 🔹 ahora el campo es numérico
  searchResults: Product[] = [];
  selectedProduct: any = null;
  isLoading: boolean = false;
  hasSearched: boolean = false;

  sizeSummary: { size: string; quantity: number }[] = [];
  totalQuantity: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Normaliza un producto para que nunca tenga valores null/undefined */
  private normalizeProduct(product: any): Product {
    return {
      ...product,
      id: product.id,
      reference: product.reference ?? 'N/A',
      brand: product.brand ?? 'N/A',
      op: product.op ?? 'N/A',
      campaign: product.campaign ?? 'N/A',
      type: product.type ?? 'N/A',
      description: product.description ?? 'Sin descripción',
      price: product.price ?? 0,
      quantity: product.quantity ?? 0,
      cycleCalculated: product.cycleCalculated ?? 0,
      quantityMade: product.quantityMade ?? 0,
      missing: product.missing ?? 0,
      deliveryPercentage: product.deliveryPercentage ?? 0,
      sam: product.sam ?? 0,
      samTotal: product.samTotal ?? 0,
      loadDays: product.loadDays ?? 0,
      stoppageReason: product.stoppageReason ?? 'N/A',
      actualDeliveryDate: product.actualDeliveryDate ?? null,
      status: product.status ?? 'N/A',
      numPersons: product.team?.numPersons ?? 0,
      team: {
        name: product.team?.name ?? 'N/A',
        description: product.team?.description ?? 'N/A',
        numPersons: product.team?.numPersons ?? 0
      },
      sizeQuantities: product.sizeQuantities ?? {}
    };
  }

  async loadInitialData(): Promise<void> {
    try {
      this.isLoading = true;
      const products = await firstValueFrom(this.productService.getProducts());
      if (products && Array.isArray(products)) {
        this.searchResults = products.slice(-5).map((p) => this.normalizeProduct(p));
        this.selectedProduct = null;
        this.sizeSummary = [];
        this.totalQuantity = 0;
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /** 🔹 Nueva lógica de búsqueda por OP directamente en el backend */
  async searchByOP(): Promise<void> {
    if (!this.searchOp) {
      this.clearSearch();
      return;
    }

    try {
      this.isLoading = true;
      this.hasSearched = true;

      console.log('Buscando productos por OP:', this.searchOp);
      const products = await firstValueFrom(this.productService.searchProductsByOp(this.searchOp));

      if (products && products.length > 0) {
        this.searchResults = products.map((p: Product) => this.normalizeProduct(p));
        this.selectProduct(this.searchResults[0]);
      } else {
        console.log('No se encontraron productos para la OP:', this.searchOp);
        this.searchResults = [];
        this.selectedProduct = null;
        this.sizeSummary = [];
        this.totalQuantity = 0;
      }
    } catch (error) {
      console.error('Error en la búsqueda por OP:', error);
      this.searchResults = [];
      this.selectedProduct = null;
    } finally {
      this.isLoading = false;
    }
  }

  selectProduct(product: Product): void {
    console.log('Producto seleccionado:', product);
    this.selectedProduct = product;
    this.calculateSizeSummary();
  }

  private calculateSizeSummary(): void {
    if (!this.selectedProduct || !this.selectedProduct.sizeQuantities) {
      this.sizeSummary = [];
      this.totalQuantity = 0;
      return;
    }
    const sizeQuantities: Record<string, number> = this.selectedProduct.sizeQuantities;
    this.sizeSummary = Object.entries(sizeQuantities)
      .map(([size, quantity]) => ({ size, quantity }))
      .sort((a, b) => {
        const aNum = parseFloat(a.size);
        const bNum = parseFloat(b.size);
        return isNaN(aNum) || isNaN(bNum)
          ? a.size.localeCompare(b.size)
          : aNum - bNum;
      });
    this.totalQuantity = this.sizeSummary.reduce((total, item) => total + item.quantity, 0);
  }

  clearSearch(): void {
    this.searchOp = null;
    this.searchResults = [];
    this.selectedProduct = null;
    this.sizeSummary = [];
    this.totalQuantity = 0;
    this.hasSearched = false;
  }

  trackByProduct(index: number, product: Product): string {
    return product.op;
  }

  volverAlHome(): void {
    this.router.navigate(['/home']);
  }

  exportToPdf(): void {
    if (this.selectedProduct) {
      generateProductPdf(this.selectedProduct, this.sizeSummary, this.totalQuantity);
    }
  }
}

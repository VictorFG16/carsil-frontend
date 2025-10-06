import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";


export interface Product {
  id: number;
  description: string;
  price: number;
  quantity: number;
  assignedDate: string;
  plantEntryDate: string;
  reference: string;
  brand: string;
  op: string;
  campaign: string;
  type: string;
  size: string;
  module: any; // Cambiado a any para manejar objeto o string
  status?: string;
  sizeQuantities?: Record<string, number>;
  stoppageReason : string;
  actualDeliveryDate: string;
  sam: number;
  cycleCalculated?: string;
  quantityMade?: number;
  missing?: number;
  quantityPending?: number;
  deliveryPercentage?: number;
  loadDays: number;
  totaLoadDays?: number;
  numPersons?: number;
  samTotal?: number;
  totalPrice?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private apiservice: ApiService) {}

    searchProducts(q: string) {
        return this.apiservice.get(`/products/search?q=${q}`);
    }
    searchProductsByOp(op: number) {
        return this.apiservice.get(`/products/by-op/${op}`);
    }

    getProductsByModule(moduleId: number) {
        return this.apiservice.get(`/products/module/${moduleId}`);
    }
    getProductsByDateRange(startDate: string, endDate: string) {
        return this.apiservice.get(`/products/date-range?start=${startDate}&end=${endDate}`);
    }
    getProducts() {
        return this.apiservice.get('/products');
    }

    getProductById(id: number) {
        return this.apiservice.get(`/products/${id}`);
    }

    createProduct(product: any) {
        return this.apiservice.post('/products', product);
    }

    updateProduct(id: number, product: any) {
        return this.apiservice.put(`/products/${id}`, product);
    }

    deleteProduct(id: number) {
        return this.apiservice.delete(`/products/${id}`);
    }
}

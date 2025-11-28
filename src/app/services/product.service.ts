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
  team: any; 
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

    getAllEnums() {
        return this.apiservice.get('/products/enums');
    }

    searchProducts(q: string) {
        return this.apiservice.get(`/products/search?q=${q}`);
    }
    searchProductsByOp(op: number) {
        return this.apiservice.get(`/products/by-op/${op}`);
    }

    getProductsByTeam(teamId: number) {
        return this.apiservice.get(`/products/by-team/${teamId}`);
    }
    getProductsByDateRange(startDate: string, endDate: string) {
        return this.apiservice.get(`/products/date-range?start=${startDate}&end=${endDate}`);
    }
    getProductsByDateRangeAndTeam(startDate?: string, endDate?: string, teamId?: number) {
        let url = '/products/by-date-range?';
        const params: string[] = [];
        
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (teamId !== null && teamId !== undefined) params.push(`teamId=${teamId}`);
        
        url += params.join('&');
        return this.apiservice.get(url);
    }
    getProducts() {
        return this.apiservice.get('/products');
    }
   getActiveProducts() {
        return this.apiservice.get('/products/active');
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

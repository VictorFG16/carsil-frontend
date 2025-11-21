import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface ProgramacionReporte {
id?: number;
fechaEnvio: string;
horaEnvio: string;
emailDestinatario: string;
fechaCreacion?: string;
}

@Injectable({
providedIn: 'root'
})
export class ReporteService {

constructor(private apiService: ApiService) { }

  crearProgramacion(programacion: Omit<ProgramacionReporte, 'id' | 'fechaCreacion'>) {
    return this.apiService.post('/reportes/programar', programacion, { responseType: 'text' });
  }

  getProgramaciones() {
    return this.apiService.get('/reportes/programaciones');
  }

  getProgramacionById(id: number) {
    return this.apiService.get(`/reportes/programaciones/${id}`);
  }

  updateProgramacion(id: number, programacion: Partial<ProgramacionReporte>) {
    return this.apiService.put(`/reportes/programaciones/${id}`, programacion);
  }

  deleteProgramacion(id: number) {
    return this.apiService.delete(`/reportes/programaciones/${id}`);
  }
}

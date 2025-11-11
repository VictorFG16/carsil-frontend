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

  // Crear una nueva programación de reporte
  crearProgramacion(programacion: Omit<ProgramacionReporte, 'id' | 'fechaCreacion'>) {
    return this.apiService.post('/reportes/programar', programacion);
  }

  // Obtener todas las programaciones de reportes
  getProgramaciones() {
    return this.apiService.get('/reportes/programaciones');
  }

  // Obtener una programación por ID
  getProgramacionById(id: number) {
    return this.apiService.get(`/reportes/programaciones/${id}`);
  }

  // Actualizar una programación
  updateProgramacion(id: number, programacion: Partial<ProgramacionReporte>) {
    return this.apiService.put(`/reportes/programaciones/${id}`, programacion);
  }

  // Eliminar una programación
  deleteProgramacion(id: number) {
    return this.apiService.delete(`/reportes/programaciones/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Team {
  id: number;
  name: string;
  description: string;
  numPersons: number;
  loadDays: string;
  totalDays: number;
}
@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private apiService: ApiService) { }

  getAllTeams(){
    return this.apiService.get('/teams');
  }

  getTeamById(id: number) {
    return this.apiService.get(`/teams/${id}`);
  }
  createTeam(team: any) {
    return this.apiService.post('/teams', team);
  }

  updateTeam(id: number, team: any) {
    return this.apiService.put(`/teams/${id}`, team);
  }

  // deleteTeam(id: number) {
  //   return this.apiService.delete(`/teams/${id}`);
  // }
}

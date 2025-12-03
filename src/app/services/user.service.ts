import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";

export interface User {
  id: number;
  name: string;
  email: string;
 password: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private apiservice: ApiService) {}

    getUsers() {
        return this.apiservice.get('/users');
    }

    getUserById(id: number) {
        return this.apiservice.get(`/users/${id}`);
    }

    createUser(user: any) {
        return this.apiservice.post('/users', user);
    }

    updateUser(id: number, user: any) {
        return this.apiservice.put(`/users/${id}`, user);
    }

    deleteUser(id: number) {
        return this.apiservice.delete(`/users/${id}`);
    }
}

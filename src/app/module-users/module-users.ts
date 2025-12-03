import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../dashboard/navbar/navbar';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-module-users',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './module-users.html',
  styleUrl: './module-users.css'
})
export class ModuleUsers implements OnInit, AfterViewInit {
  users: User[] = [];
  loading = true;
  error = '';
  selectedRow: number | null = null;
  showDeleteModal = false;
  userToDelete: User | null = null;
  errorMessage = '';
  private tooltipList: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }

  initializeTooltips() {
    this.tooltipList.forEach(tooltip => {
      try {
        tooltip.dispose();
      } catch (e) {}
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

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.users = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los usuarios';
        this.loading = false;
      }
    });
  }

  selectRow(index: number) {
    if (this.selectedRow === index) {
      this.selectedRow = null; // Deseleccionar si es la misma fila
    } else {
      this.selectedRow = index;
    }
  }

  isAnyRowSelected(): boolean {
    return this.selectedRow !== null;
  }

  agregarUsuario() {
    this.router.navigate(['/module-users/add-user']);
  }

  eliminarFila() {
    if (this.selectedRow !== null) {
      this.userToDelete = this.users[this.selectedRow];
      this.showDeleteModal = true;
    }
  }

  confirmarEliminacion() {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.selectedRow = null;
          this.loadUsers();
          this.mostrarModalExito();
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar el usuario';
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelarEliminacion() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  mostrarModalExito() {
    const modalElement = document.getElementById('modalExito');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.loadUsers();
      }, { once: true });
    }
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }
}

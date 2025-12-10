import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../dashboard/navbar/navbar';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';
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
  currentUserName: string | null = null;
  currentUserId: number | null = null;
  currentUser: User | null = null;
  private tooltipList: any[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUserName = localStorage.getItem('userName');
    this.loadCurrentUser();
    this.loadUsers();
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
      } catch (e) {}
    });
    this.tooltipList = [];

    // Remover elementos tooltip del DOM
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());

    // Crear nuevos tooltips
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

  loadCurrentUser() {
    if (this.currentUserName) {
      this.authService.getCurrentUser().subscribe({
        next: (user: any) => {
          this.currentUserId = user.id;
          this.currentUser = user;
        },
        error: (err) => {
          console.error('Error al cargar usuario actual:', err);
        }
      });
    }
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
    
    // Destruir todos los tooltips antes de reinicializar
    this.destroyAllTooltips();
    
    // Reinicializar tooltips después de cambiar la selección
    setTimeout(() => {
      this.initializeTooltips();
    }, 50);
  }

  private destroyAllTooltips() {
    // Destruir TODOS los tooltips anteriores
    this.tooltipList.forEach(tooltip => {
      try {
        tooltip.hide();
        tooltip.dispose();
      } catch (e) {
        // Ignorar errores
      }
    });
    this.tooltipList = [];

    // Remover elementos tooltip del DOM
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
  }

  isAnyRowSelected(): boolean {
    return this.selectedRow !== null;
  }

  isCurrentUserSelected(): boolean {
    if (this.selectedRow !== null && this.currentUserId !== null) {
      return this.users[this.selectedRow]?.id === this.currentUserId;
    }
    return false;
  }

  canDeleteSelectedUser(): boolean {
    return this.isAnyRowSelected() && !this.isCurrentUserSelected();
  }

  agregarUsuario() {
    this.router.navigate(['/module-users/add-user']);
  }

  editarUsuario() {
    if (this.selectedRow !== null) {
      const userId = this.users[this.selectedRow].id;
      this.router.navigate(['/module-users/edit-user', userId]);
    }
  }

  eliminarFila() {
    if (this.selectedRow !== null && !this.isCurrentUserSelected()) {
      this.userToDelete = this.users[this.selectedRow];
      this.showDeleteModal = true;
    } else if (this.isCurrentUserSelected()) {
      this.errorMessage = 'No puedes eliminar tu propio usuario mientras estás conectado';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
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

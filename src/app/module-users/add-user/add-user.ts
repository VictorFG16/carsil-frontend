import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../dashboard/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-add-user',
  imports: [FormsModule, Navbar, CommonModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css'
})
export class AddUser implements OnInit {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errorMessage = '';
  showPassword = false;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  usernamePattern = /^[a-zA-Z0-9_]+$/; // Solo letras, números y guión bajo
  existingUsers: any[] = [];
  emailError = '';
  usernameError = '';
  passwordError = '';

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    await this.loadExistingUsers();
  }

  async loadExistingUsers() {
    try {
      this.existingUsers = await firstValueFrom(this.userService.getUsers());
    } catch (error) {
      
    }
  }

  validateEmail() {
    this.emailError = '';
    if (this.user.email) {
      // Validar formato
      if (!this.emailPattern.test(this.user.email)) {
        this.emailError = 'El email no es válido. Debe tener el formato: ejemplo@dominio.com';
        return;
      }
      // Validar duplicados
      const exists = this.existingUsers.some(u => u.email.toLowerCase() === this.user.email.toLowerCase());
      if (exists) {
        this.emailError = 'Este email ya está registrado';
      }
    }
  }

  validateUsername() {
    this.usernameError = '';
    if (this.user.name) {
      // Validar caracteres especiales y espacios
      if (!this.usernamePattern.test(this.user.name)) {
        this.usernameError = 'El nombre de usuario solo puede contener letras, números y guión bajo (sin espacios ni caracteres especiales)';
        return;
      }
      // Validar duplicados
      const exists = this.existingUsers.some(u => u.name.toLowerCase() === this.user.name.toLowerCase());
      if (exists) {
        this.usernameError = 'Este nombre de usuario ya está en uso';
      }
    }
  }

  validatePassword() {
    this.passwordError = '';
    if (this.user.password && this.user.password.length < 7) {
      this.passwordError = 'La contraseña debe tener al menos 7 caracteres';
    }
  }

  async onSubmit(form: NgForm) {
    this.validateEmail();
    this.validateUsername();
    this.validatePassword();

    if (form.invalid || this.emailError || this.usernameError || this.passwordError) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    try {
      await firstValueFrom(this.userService.createUser(this.user));
      this.mostrarModalExito();
    } catch (error: any) {
      
      this.errorMessage = error.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.';
    }
  }

  mostrarModalExito() {
    const modalElement = document.getElementById('modalExito');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.router.navigate(['/module-users']);
      }, { once: true });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  volverAlHome() {
    this.router.navigate(['/module-users']);
  }
}

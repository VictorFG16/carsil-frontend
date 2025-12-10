import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../dashboard/navbar/navbar';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, Navbar, CommonModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css'
})
export class EditUser implements OnInit {
  user = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };
  confirmPassword = '';
  userId: number = 0;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  usernamePattern = /^[a-zA-Z0-9_]+$/;
  existingUsers: any[] = [];
  emailError = '';
  usernameError = '';
  passwordError = '';
  confirmPasswordError = '';
  loading = true;

  // Roles disponibles desde el backend
  roles = [
    { value: 'USER', label: 'User' },
    { value: 'FULL_ACCESS', label: 'Full Access' },
    { value: 'RECIPIENT', label: 'Recipient' }
  ];

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.userId) {
      this.errorMessage = 'ID de usuario no válido';
      this.loading = false;
      return;
    }
    await this.loadUser();
    await this.loadExistingUsers();
  }

  async loadUser() {
    try {
      const userData = await firstValueFrom(this.userService.getUserById(this.userId));
      this.user = {
        name: userData.name,
        email: userData.email,
        password: '', // No mostramos la contraseña actual
        role: userData.role || 'USER'
      };
      this.loading = false;
    } catch (error) {
      this.errorMessage = 'Error al cargar el usuario';
      this.loading = false;
    }
  }

  async loadExistingUsers() {
    try {
      this.existingUsers = await firstValueFrom(this.userService.getUsers());
      // Filtrar el usuario actual para evitar conflictos en validación
      this.existingUsers = this.existingUsers.filter(u => u.id !== this.userId);
    } catch (error) {
      console.error('Error al cargar usuarios existentes:', error);
    }
  }

  validateEmail() {
    this.emailError = '';
    if (this.user.email) {
      if (!this.emailPattern.test(this.user.email)) {
        this.emailError = 'El email no es válido. Debe tener el formato: ejemplo@dominio.com';
        return;
      }
      const exists = this.existingUsers.some(u => u.email.toLowerCase() === this.user.email.toLowerCase());
      if (exists) {
        this.emailError = 'Este email ya está registrado';
      }
    }
  }

  validateUsername() {
    this.usernameError = '';
    if (this.user.name) {
      if (!this.usernamePattern.test(this.user.name)) {
        this.usernameError = 'El nombre de usuario solo puede contener letras, números y guión bajo (sin espacios ni caracteres especiales)';
        return;
      }
      const exists = this.existingUsers.some(u => u.name.toLowerCase() === this.user.name.toLowerCase());
      if (exists) {
        this.usernameError = 'Este nombre de usuario ya está en uso';
      }
    }
  }

  validatePassword() {
    this.passwordError = '';
    // Solo validar si se ingresó una nueva contraseña
    if (this.user.password && this.user.password.length > 0 && this.user.password.length < 7) {
      this.passwordError = 'La contraseña debe tener al menos 7 caracteres';
    }
  }

  validateConfirmPassword() {
    this.confirmPasswordError = '';
    // Solo validar si se ingresó una contraseña
    if (this.user.password && this.user.password.length > 0 && this.confirmPassword !== this.user.password) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
    }
  }

  async onSubmit(form: NgForm) {
    this.validateEmail();
    this.validateUsername();
    this.validatePassword();
    this.validateConfirmPassword();

    if (form.invalid || this.emailError || this.usernameError || this.passwordError || this.confirmPasswordError) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    try {
      // Crear objeto con datos a actualizar
      const updateData: any = {
        name: this.user.name,
        email: this.user.email,
        role: this.user.role
      };

      // Solo incluir password si se ingresó una nueva
      if (this.user.password && this.user.password.length > 0) {
        updateData.password = this.user.password;
      }

      await firstValueFrom(this.userService.updateUser(this.userId, updateData));
      this.mostrarModalExito();
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Error al actualizar el usuario. Por favor, intente nuevamente.';
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  volverAlHome() {
    this.router.navigate(['/module-users']);
  }
}

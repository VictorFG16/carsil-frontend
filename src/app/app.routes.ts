import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { AddProduct } from './dashboard/inventory-table/add-product/add-product';
import { EditProduct } from './dashboard/inventory-table/edit-product/edit-product';
import { Home } from './home/home';
import { DashboardDeModulos } from './dashboard-de-modulos/dashboard-de-modulos';
import { EditModulo } from './dashboard-de-modulos/edit-modulo/edit-modulo';
import { Buscador } from './buscador/buscador';
import { AgregarModulo } from './dashboard-de-modulos/agregar-modulo/agregar-modulo';
import { Reportes } from './reportes/reportes';

import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },

  //  Home protegido
  { path: 'home', component: Home, canActivate: [AuthGuard] },

  //  Todas las demás rutas protegidas
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'add-product', component: AddProduct, canActivate: [AuthGuard] },
  { path: 'edit-product/:id', component: EditProduct, canActivate: [AuthGuard] },
  { path: 'dashboard-de-modulos', component: DashboardDeModulos, canActivate: [AuthGuard] },
  { path: 'edit-modulo/:id', component: EditModulo, canActivate: [AuthGuard] },
  { path: 'agregar-modulo', component: AgregarModulo, canActivate: [AuthGuard] },
  { path: 'buscador', component: Buscador, canActivate: [AuthGuard] },
  { path: 'reportes', component: Reportes, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' }
];

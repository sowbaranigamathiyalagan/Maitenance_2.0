import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Overview } from './modules/overview/overview';
import { Reports } from './modules/reports/reports';
import { Settings } from './modules/settings/settings';
import { Scanner } from './modules/scanner/scanner';
import { Quality } from './modules/quality/quality';
import { LayoutComponent } from './layout/layout/layout';
import { authGuard, loginGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'overview', component: Overview },
      { path: 'scanner', component: Scanner },
      { path: 'reports', component: Reports },
      { path: 'settings', component: Settings },
      { path: 'quality', component: Quality }
    ]
  }

];
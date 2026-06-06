import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Overview } from './modules/overview/overview';
import { Reports } from './modules/reports/reports';
import { Scanner } from './modules/scanner/scanner';
import { Quality } from './modules/quality/quality';
import { HodApproval } from './modules/hod-approval/hod-approval';
import { LayoutComponent } from './layout/layout/layout';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { Recents } from './modules/recents/recents';
import { Settings } from './modules/settings/settings';


import { DashboardComponent } from './modules/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'overview', component: Overview },
      { path: 'scanner', component: Scanner },
      { path: 'recents', component: Recents },
      { path: 'quality', component: Quality },
      { path: 'hod-approval', component: HodApproval },
      { path: 'settings', component: Settings }
    ]
  }

];
import { PMSchedule } from './modules/pm-schedule/pm-schedule';
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Overview } from './modules/overview/overview';
import { Scanner } from './modules/scanner/scanner';
import { LayoutComponent } from './layout/layout/layout';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { Recents } from './modules/recents/recents';
import { Settings } from './modules/settings/settings';
import { SignOffComponent } from './modules/sign-off/sign-off';
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
      { path: 'settings', component: Settings },
      { path: 'pm-schedule', component: PMSchedule },
      { path: 'sign-off', component: SignOffComponent }
    ]
  }
];

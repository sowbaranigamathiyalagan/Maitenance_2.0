import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Overview } from './modules/overview/overview';
import { Reports } from './modules/reports/reports';
import { Settings } from './modules/settings/settings';

export const routes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'overview', component: Overview },
  { path: 'reports', component: Reports },
  { path: 'settings', component: Settings}
];
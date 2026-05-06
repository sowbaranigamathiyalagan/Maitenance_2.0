import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Overview } from './modules/overview/overview';
import { Reports } from './modules/reports/reports';
import { Settings } from './modules/settings/settings';
import { Scanner } from './modules/scanner/scanner';
import { Quality } from './modules/quality/quality';
import { LayoutComponent } from './layout/layout/layout';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'overview', component: Overview },
      { path: 'scanner', component: Scanner },
      { path: 'reports', component: Reports },
      { path: 'settings', component: Settings },
      { path: 'quality', component: Quality }
    ]
  }
];
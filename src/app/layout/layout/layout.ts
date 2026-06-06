import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ButtonModule, DialogModule, MenuModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  userName: string = '';
  userMenuItems: MenuItem[] | undefined;

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.userName = this.cookieService.get('Username') || 'User';

    this.userMenuItems = [
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => {
          this.authService.logout();
        }
      }
    ];
  }
}
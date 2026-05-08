import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TooltipModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent implements OnInit {
  userType: string = '';
  userName: string = '';
  showProfilePopup: boolean = false;

  constructor(
    private cookieService: CookieService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userType = this.cookieService.get('Usertype') || '';
    this.userName = this.cookieService.get('Username') || 'User';
  }

  toggleProfile() {
    this.showProfilePopup = !this.showProfilePopup;
  }

  logout() {
    this.authService.logout();
  }

  get isQA() {
    return this.userType === 'QA' || this.isAdmin;
  }

  get isIMS() {
    return this.userType === 'IMG' || this.isAdmin;
  }

  get isAdmin() {
    return this.userType === 'BASE-ADMIN' || this.userType === 'ADMIN';
  }
}

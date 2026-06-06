import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterModule,
    TooltipModule,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent implements OnInit {

  // ── Session info ────────────────────────────────────────────
  userType: string = '';
  userName: string = '';
  plantname: string = '';

  constructor(
    private cookieService: CookieService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userType  = this.cookieService.get('Usertype')   || '';
    this.userName  = this.cookieService.get('Username')   || 'User';
    this.plantname = this.cookieService.get('Plantname')  || sessionStorage.getItem('udPlantname') || '';
  }

  // ── Role helpers ─────────────────────────────────────────────
  get isAdmin() { return this.userType === 'BASE-ADMIN' || this.userType === 'ADMIN'; }
  get isQA()    { return this.userType === 'QA'  || this.isAdmin; }
  get isIMS()   { return this.userType === 'IMG' || this.isAdmin; }

  // ── Logout ───────────────────────────────────────────────────
  logout() { this.authService.logout(); }
}

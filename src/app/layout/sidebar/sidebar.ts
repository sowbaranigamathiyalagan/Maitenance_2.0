import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TooltipModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent implements OnInit {
  userType: string = '';

  constructor(private cookieService: CookieService) {}

  ngOnInit() {
    this.userType = this.cookieService.get('Usertype') || '';
  }

  get isQA() {
    return this.userType === 'QA' || this.isAdmin;
  }

  get isIMS() {
    return this.userType === 'IMS' || this.isAdmin;
  }

  get isAdmin() {
    return this.userType === 'BASE-ADMIN' || this.userType === 'ADMIN';
  }
}

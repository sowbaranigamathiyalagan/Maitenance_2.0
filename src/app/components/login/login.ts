import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})

export class LoginComponent {

  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter all credentials' });
      return;
    }

    this.loading = true;
    const payload = {
      email: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;
        console.log("login success")
        this.router.navigate(['/overview']);
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Login Success'
        });
      },
      error: (err) => {
        this.loading = false;
        console.error("Login error:", err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Login Failed', 
          detail: err.error
        });
      }

    });
  }
}

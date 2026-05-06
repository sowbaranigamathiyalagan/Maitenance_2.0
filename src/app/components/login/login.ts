import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
      console.log(this.email, this.password);
    if (this.email === 'admin' && this.password === 'admin') {
      this.router.navigate(['/overview']);
    } else {
      alert('Invalid credentials');
    }
  }
}
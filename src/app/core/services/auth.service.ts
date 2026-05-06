import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';


import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);
  private apiUrl = environment.apiUrl;


  login(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/loginvalidation/`, payload).pipe(
      tap((response: any) => {
        if (response && response.valid === 'Email ID and Password matches') {
          // Save Access Token for Interceptor
          if (response.access) {
            this.saveToken(response.access);
          }

          // Save Cookies
          this.cookieService.set('Plantname', response.udPlantname);
          this.cookieService.set('Username', response.udusername);
          this.cookieService.set('Email', response.udemail);
          this.cookieService.set('Firstname', response.udfirstName);
          this.cookieService.set('Lastname', response.udlastName);
          this.cookieService.set('Usertype', response.udtype);
          this.cookieService.set('location', response.udlocation);

          // Save Session Storage
          sessionStorage.setItem('udusername', response.udusername);
          sessionStorage.setItem('udsession_id', response.sessionID);
          sessionStorage.setItem('udPlantname', response.udPlantname);
          sessionStorage.setItem('udemail', response.udemail);

          // Save to Local Storage for fallback/guards
          this.saveUser(response.udusername);
        } else {
          // If the API returns 200 but validation fails
          throw new Error(response?.valid || 'Invalid credentials');
        }
      })
    );
  }



  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  saveUser(username: string): void {
    localStorage.setItem('username', username);
  }

  getUser(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.cookieService.deleteAll();
    this.router.navigate(['/login']);
  }

}

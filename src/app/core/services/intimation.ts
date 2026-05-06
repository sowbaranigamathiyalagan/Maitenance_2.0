import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Intimation {
  private apiUrl = `${environment.apiUrl}/api/tool-intimation/create`;

  constructor(private http: HttpClient) {}

  createIntimation(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}

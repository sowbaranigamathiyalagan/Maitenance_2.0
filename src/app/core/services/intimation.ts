import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Intimation {
  private createUrl = `${environment.apiUrl}/api/tool-intimation/create`;
  private approveUrl = `${environment.apiUrl}/api/tool-intimation/approve`;
  private listUrl = `${environment.apiUrl}/api/tool-intimation/list`;

  constructor(private http: HttpClient) {}

  createIntimation(data: any): Observable<any> {
    return this.http.post(this.createUrl, data);
  }

  approveIntimation(data: any): Observable<any> {
    return this.http.post(this.approveUrl, data);
  }

  getIntimationList(): Observable<any> {
    return this.http.get(this.listUrl);
  }
}

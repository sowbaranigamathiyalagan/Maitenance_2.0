import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Intimation {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Intimation Slip
  createIntimation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/create`, data);
  }

  approveIntimation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/approve`, data);
  }

  getIntimationList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/list`);
  }

  getQaApprovalList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/qa`);
  }

  // Scanner & Tool Info
  getToolInfo(toolCode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/get-toolinfo?tool=${toolCode}`);
  }

  checkInTool(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-checkin`, data);
  }

  // Checklist
  getChecklistTemplate(toolCode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-checklist?tool=${toolCode}`);
  }

  submitChecklist(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-checklist/submit`, data);
  }

  // Action Update
  submitActionUpdate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-action-update`, data);
  }

  // Overview / Tool Status
  getToolStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-status`);
  }

  // IMG Approval List
  getImgApprovalList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/img`);
  }

  // HOD Approval Action
  approveHOD(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/approve`, data);
  }
}

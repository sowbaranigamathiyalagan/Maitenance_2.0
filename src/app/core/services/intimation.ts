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

  // Descriptions Save/Load
  saveProblemDescription(data: { category: string, description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/addToolingReasons`, data);
  }

  deleteProblemDescription(data: { category: string, description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/deleteToolingReasons`, data);
  }

  getProblemDescriptions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getToolingReasons`);
  }

  getIntimationList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/list`);
  }

  getRecentActivity(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/recent`);
  }

  getMaintenanceReport(slipId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/maintenance-report?id=${slipId}`);
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

  // Upload Image
  uploadToolImage(toolCode: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('tool', toolCode);
    formData.append('image', file);
    // Note: Http headers like Content-Type are automatically set when passing FormData
    return this.http.post(`${this.baseUrl}/api/upload-image`, formData);
  }

  // IMG Approval List
  getImgApprovalList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/img`);
  }

  // HOD Approval Action
  approveHOD(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/approve`, data);
  }

  // User Management
  getUserCode(plantname: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ucode/?Plantname=${plantname}`);
  }

  createUser(plantname: string, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usermanagement/?Plantname=${plantname}`, payload);
  }

  getUsers(plantname: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/usermanagement/?Plantname=${plantname}`);
  }

  // Checklist Master Settings
  getChecklistSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/checklist/get`);
  }

  updateChecklistSettings(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/checklist/update`, payload);
  }

  // Spare Management
  getSpares(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/spares/get`);
  }

  addSpare(payload: { itemcode: string, partName: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/spares/add`, payload);
  }

  uploadSparesCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/spares/add`, formData);
  }
}

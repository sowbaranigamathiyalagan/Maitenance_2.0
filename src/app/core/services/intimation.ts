import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Intimation {
  baseUrl = environment.apiUrl;

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

  submitPMChecksheet(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pm-checksheet/submit`, data);
  }

  getMouldMasterList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/mould-master/list`);
  }

  uploadMouldMasterExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/mould-master/upload`, formData);
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

  // Dashboard API's
  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/summary`);
  }

  getDashboardToolCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/tool-count`);
  }

  getDashboardMonthlyTrend(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/monthly-trend`);
  }

  getDashboardRecentActivities(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/recent-activities`);
  }

  getDashboardMaintenanceDuration(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/maintenance-duration-report`);
  }

  getDashboardWeeklyActivity(type: string = 'TOTAL'): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/dashboard/weekly-maintenance-activity?type=${type}`);
  }

  // PM Schedule Methods
  uploadPMSchedule(file: File, month?: number, year?: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (month) formData.append('month', month.toString());
    if (year) formData.append('year', year.toString());
    return this.http.post(`${this.baseUrl}/api/pm-schedule/upload`, formData);
  }

  addPMScheduleManual(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pm-schedule/add-manual`, data);
  }

  getPMSchedules(month?: number, year?: number): Observable<any> {
    if (month !== undefined && year !== undefined) {
      return this.http.get(`${this.baseUrl}/api/pm-schedule/list?month=${month}&year=${year}`);
    }
    return this.http.get(`${this.baseUrl}/api/pm-schedule/list`);
  }

  getPMActiveDates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/pm-schedule/active-dates`);
  }

  updatePMScheduleSignoff(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pm-schedule/update-signoff`, data);
  }

  uploadPMSchecksheet(scheduleId: number, type: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('schedule_id', scheduleId.toString());
    formData.append('checksheet_type', type);
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/pm-schedule/upload-checksheet`, formData);
  }

  getQAPendingPMSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/pm-schedule/qa-pending`);
  }

  submitQAPMRemarks(scheduleId: number, remarks: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pm-schedule/qa-submit`, {
      schedule_id: scheduleId,
      remarks: remarks
    });
  }

  deletePMSchecksheet(scheduleId: number, type: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/pm-schedule/delete-checksheet`, {
      schedule_id: scheduleId,
      checksheet_type: type
    });
  }

  inspectBreakdown(slipId: number, breakdownType: string, remarks: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/inspect`, {
      slip_id: slipId,
      breakdown_type: breakdownType,
      remarks: remarks
    });
  }

  toolroomApproveBreakdown(slipId: number, remarks: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/toolroom-approve`, {
      slip_id: slipId,
      remarks: remarks
    });
  }

  closeMinorBreakdown(slipId: number, inspectionRemarks: string, correctiveAction: string, repairedBy: string, sparesConsumed: any[] = []): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/minor-close`, {
      slip_id: slipId,
      inspection_remarks: inspectionRemarks,
      corrective_action: correctiveAction,
      repaired_by: repairedBy,
      spares_consumed: sparesConsumed
    });
  }

  getToolroomPendingBD(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/toolroom-pending`);
  }

  getQAPendingBD(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/bd-qa-pending`);
  }

  getPPCPendingBD(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/tool-intimation/bd-ppc-pending`);
  }

  submitQABDRemarks(slipId: number, remarks: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/bd-qa-submit`, {
      slip_id: slipId,
      remarks: remarks
    });
  }

  submitPPCBDRemarks(slipId: number, remarks: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/tool-intimation/bd-ppc-submit`, {
      slip_id: slipId,
      remarks: remarks
    });
  }

}
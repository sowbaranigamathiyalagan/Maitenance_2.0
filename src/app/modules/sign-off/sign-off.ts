import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SharedModule, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-sign-off',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
    InputTextModule,
    FormsModule,
    SharedModule,
    ToastModule,
    TooltipModule
  ],
  providers: [DatePipe, MessageService],
  templateUrl: './sign-off.html',
  styleUrl: './sign-off.scss'
})
export class SignOffComponent implements OnInit {
  schedules: any[] = [];
  loading: boolean = false;
  activeTab: string = '';

  // Date selection
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  years: number[] = [];

  // User roles
  userType: string = '';
  isPMInCharge: boolean = false;
  isPPC: boolean = false;
  isQA: boolean = false;
  isToolroomInCharge: boolean = false;

  // Dialogs and Data
  showPMSignoffModal: boolean = false;
  showPPCSignoffModal: boolean = false;
  showQARemarksModal: boolean = false;
  showToolroomSignoffModal: boolean = false;
  showQABDModal: boolean = false;
  showPPCBDModal: boolean = false;
  selectedSchedule: any = null;
  selectedSlip: any = null;
  highlightedScheduleId: number | null = null;
  firstRowIndex: number = 0;

  pmSignoffData = {
    pm_in_charge: '',
    remark: ''
  };

  ppcSignoffData = {
    ppc_sign: '',
    remark: ''
  };

  qaPendingSchedules: any[] = [];
  qaRemarksData = {
    remarks: ''
  };

  toolroomPendingSlips: any[] = [];
  toolroomRemarksData = {
    remarks: ''
  };

  ppcPendingSlips: any[] = [];
  ppcbdRemarksData = {
    name: '',
    remarks: ''
  };

  qaPendingSlips: any[] = [];
  qabdRemarksData = {
    remarks: ''
  };

  get pendingPPCSchedules(): any[] {
    return this.schedules ? this.schedules.filter((s: any) => s.status === 'PM_COMPLETED' && !s.ppc_sign) : [];
  }

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear + 3; y++) {
      this.years.push(y);
    }
  }

  ngOnInit() {
    this.userType = this.cookieService.get('Usertype') || '';
    const isAdmin = this.userType === 'ADMIN' || this.userType === 'BASE-ADMIN';

    // Map Usertype to PM, PPC, and Toolroom roles
    this.isPMInCharge = this.userType === 'MAINTENANCE' || isAdmin;
    this.isPPC = this.userType === 'IMG' || isAdmin;
    this.isQA = this.userType === 'QA' || isAdmin;
    this.isToolroomInCharge = isAdmin;

    // Set default active tab
    if (this.isPMInCharge) {
      this.activeTab = 'pm_in_charge';
    } else if (this.isToolroomInCharge) {
      this.activeTab = 'toolroom';
    } else if (this.isPPC) {
      this.activeTab = 'ppc';
    } else if (this.isQA) {
      this.activeTab = 'qa_remarks';
    }

    // Read query parameters to determine highlighted schedule and initial active tab
    this.route.queryParams.subscribe(params => {
      if (params['schedule_id']) {
        this.highlightedScheduleId = parseInt(params['schedule_id'], 10);
      }
      if (params['role']) {
        const role = params['role'];
        if (role === 'pm' && this.isPMInCharge) {
          this.activeTab = 'pm_in_charge';
        } else if (role === 'ppc' && this.isPPC) {
          this.activeTab = 'ppc';
        }
      }
    });

    this.loadSchedules();
  }

  loadSchedules() {
    this.loading = true;
    this.loadToolroomPending();
    this.loadBDPendingRemarks();
    if (this.isQA) {
      this.intimationService.getQAPendingPMSchedules().subscribe({
        next: (res: any[]) => {
          this.qaPendingSchedules = res;
        },
        error: (err: any) => {
          console.error('Failed to load QA pending schedules:', err);
        }
      });
    }
    this.intimationService.getPMSchedules().subscribe({
      next: (res: any[]) => {
        this.schedules = res;
        this.loading = false;
        
        // Calculate pagination page to automatically display the highlighted schedule
        if (this.highlightedScheduleId) {
          const index = this.schedules.findIndex(s => s.id === this.highlightedScheduleId);
          if (index !== -1) {
            const rowsPerPage = 10;
            this.firstRowIndex = Math.floor(index / rowsPerPage) * rowsPerPage;
          }
        }
        
        this.cdr.detectChanges();
        
        // Smoothly scroll the highlighted row into the center of view
        if (this.highlightedScheduleId) {
          setTimeout(() => {
            const el = document.querySelector('.highlighted-row');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        }
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Unable to fetch PM schedules.'
        });
        this.loading = false;
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  openPMSignoffModal(row: any) {
    this.selectedSchedule = row;
    this.pmSignoffData = {
      pm_in_charge: row.pm_in_charge || '',
      remark: row.remark || ''
    };
    this.showPMSignoffModal = true;
  }

  submitPMSignoff() {
    if (!this.selectedSchedule) return;
    if (!this.pmSignoffData.pm_in_charge) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Supervisor name is required for PM Sign-Off.'
      });
      return;
    }

    this.loading = true;
    const payload = {
      schedule_id: this.selectedSchedule.id,
      pm_in_charge: this.pmSignoffData.pm_in_charge,
      remark: this.pmSignoffData.remark
    };

    this.intimationService.updatePMScheduleSignoff(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'PM Signed Off',
          detail: 'PM in-charge sign-off recorded successfully.'
        });
        this.showPMSignoffModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to record PM sign-off.'
        });
        this.loading = false;
      }
    });
  }

  openPPCSignoffModal(row: any) {
    this.selectedSchedule = row;
    this.ppcSignoffData = {
      ppc_sign: row.ppc_sign || '',
      remark: row.remark || ''
    };
    this.showPPCSignoffModal = true;
  }

  submitPPCSignoff() {
    if (!this.selectedSchedule) return;
    if (!this.ppcSignoffData.ppc_sign || !this.ppcSignoffData.remark) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Both PPC Planner Name and Remarks are required.'
      });
      return;
    }

    this.loading = true;
    const payload = {
      schedule_id: this.selectedSchedule.id,
      ppc_sign: this.ppcSignoffData.ppc_sign,
      remark: this.ppcSignoffData.remark
    };

    this.intimationService.updatePMScheduleSignoff(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'PPC Remarks Submitted',
          detail: 'PPC planner remarks recorded successfully.'
        });
        this.showPPCSignoffModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to record PPC remarks.'
        });
        this.loading = false;
      }
    });
  }

  openQARemarksModal(row: any) {
    this.selectedSchedule = row;
    this.qaRemarksData = {
      remarks: ''
    };
    this.showQARemarksModal = true;
  }

  submitQARemarks() {
    if (!this.selectedSchedule) return;
    if (!this.qaRemarksData.remarks) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Remarks are required.'
      });
      return;
    }

    this.loading = true;
    this.intimationService.submitQAPMRemarks(this.selectedSchedule.id, this.qaRemarksData.remarks).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Remarks Submitted',
          detail: 'QA remarks submitted and PM schedule closed successfully.'
        });
        this.showQARemarksModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to submit QA remarks.'
        });
        this.loading = false;
      }
    });
  }

  loadToolroomPending() {
    if (this.isToolroomInCharge) {
      this.intimationService.getToolroomPendingBD().subscribe({
        next: (res: any) => {
          this.toolroomPendingSlips = res;
        },
        error: (err: any) => {
          console.error('Failed to load Toolroom pending Major Breakdowns:', err);
        }
      });
    }
  }

  loadBDPendingRemarks() {
    if (this.isQA) {
      this.intimationService.getQAPendingBD().subscribe({
        next: (res: any) => {
          this.qaPendingSlips = res;
        },
        error: (err: any) => {
          console.error('Failed to load QA pending Breakdowns:', err);
        }
      });
    }
    if (this.isPPC) {
      this.intimationService.getPPCPendingBD().subscribe({
        next: (res: any) => {
          this.ppcPendingSlips = res;
        },
        error: (err: any) => {
          console.error('Failed to load PPC pending Breakdowns:', err);
        }
      });
    }
  }

  openToolroomModal(row: any) {
    this.selectedSlip = row;
    this.toolroomRemarksData = { remarks: '' };
    this.showToolroomSignoffModal = true;
  }

  submitToolroomSignoff() {
    if (!this.selectedSlip) return;
    this.loading = true;
    this.intimationService.toolroomApproveBreakdown(this.selectedSlip.id, this.toolroomRemarksData.remarks).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sign-Off Recorded',
          detail: 'Toolroom In-charge sign-off recorded successfully.'
        });
        this.showToolroomSignoffModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to record Toolroom sign-off.'
        });
        this.loading = false;
      }
    });
  }

  openQABDModal(row: any) {
    this.selectedSlip = row;
    this.qabdRemarksData = { remarks: '' };
    this.showQABDModal = true;
  }

  submitQABDRemarks() {
    if (!this.selectedSlip) return;
    if (!this.qabdRemarksData.remarks) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Remarks are required.'
      });
      return;
    }
    this.loading = true;
    this.intimationService.submitQABDRemarks(this.selectedSlip.id, this.qabdRemarksData.remarks).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'QA Remarks Submitted',
          detail: 'QA breakdown remarks submitted successfully.'
        });
        this.showQABDModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to submit QA breakdown remarks.'
        });
        this.loading = false;
      }
    });
  }

  openPPCBDModal(row: any) {
    this.selectedSlip = row;
    this.ppcbdRemarksData = { name: '', remarks: '' };
    this.showPPCBDModal = true;
  }

  submitPPCBDRemarks() {
    if (!this.selectedSlip) return;
    if (!this.ppcbdRemarksData.name || !this.ppcbdRemarksData.remarks) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Both PPC Planner Name and Remarks are required.'
      });
      return;
    }
    this.loading = true;
    // For breakdown PPC remarks, we submit the remarks and save ppc name
    this.intimationService.submitPPCBDRemarks(this.selectedSlip.id, this.ppcbdRemarksData.remarks).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'PPC Remarks Submitted',
          detail: 'PPC breakdown remarks submitted successfully.'
        });
        this.showPPCBDModal = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to submit PPC breakdown remarks.'
        });
        this.loading = false;
      }
    });
  }
}

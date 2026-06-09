import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { SharedModule, MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, TextareaModule, FormsModule, SharedModule],
  providers: [DatePipe, MessageService],
  templateUrl: './quality.html',
  styleUrl: './quality.scss',
})
export class Quality implements OnInit {
  activeTab: string = 'approve';
  approveList: any[] = [];
  awaitingList: any[] = [];
  loading: boolean = false;

  // Remarks Popup
  showRemarksPopup: boolean = false;
  approvalRemarks: string = '';
  selectedRow: any = null;
  selectedTab: string = '';
  approvalStatus: 'APPROVED' | 'REJECTED' = 'APPROVED';

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    if (this.activeTab === 'approve') {
      this.fetchApproveList();
    } else {
      this.fetchAwaitingList();
    }
  }

  fetchApproveList() {
    this.loading = true;
    this.intimationService.getIntimationList().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.approveList = [...(res.intimations || [])];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch approve list.',
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  fetchAwaitingList() {
    this.loading = true;
    this.intimationService.getQaApprovalList().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.awaitingList = [...(res.intimations || [])];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch awaiting dispatch list.',
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.refreshData();
  }

  approveRow(rowData: any, tab: string, status: 'APPROVED' | 'REJECTED' = 'APPROVED') {
    this.selectedRow = rowData;
    this.selectedTab = tab;
    this.approvalStatus = status;
    if (tab === 'approve') {
      this.approvalRemarks = 'Pre-QA Approved';
    } else {
      this.approvalRemarks = status === 'APPROVED' ? 'Parts OK' : 'Parts Rejected';
    }
    this.showRemarksPopup = true;
  }

  confirmApproval(rowData: any, tab: string, remarks: string, status: 'APPROVED' | 'REJECTED') {
    let payload: any;
    
    if (tab === 'approve') {
      payload = {
        slip_id: rowData.id,
        stage: 'PRE_QA',
        remarks: remarks || 'Pre-QA Approved'
      };
    } else {
      payload = {
        slip_id: rowData.id,
        stage: 'FINAL_QA',
        qa_status: status,
        remarks: remarks || (status === 'APPROVED' ? 'Parts OK' : 'Parts Rejected')
      };
    }

    this.loading = true;
    this.intimationService.approveIntimation(payload).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'success',
            summary: status === 'APPROVED' ? 'Approved' : 'Rejected',
            detail: res.message || `QA ${status.toLowerCase()} successfully.`,
          });
          this.showRemarksPopup = false;
          this.loading = false;
          if (tab === 'approve') this.fetchApproveList();
          else this.fetchAwaitingList();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${status.toLowerCase()} intimation.`,
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }
}

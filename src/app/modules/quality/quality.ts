import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SharedModule, MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SharedModule],
  providers: [DatePipe],
  templateUrl: './quality.html',
  styleUrl: './quality.scss',
})
export class Quality implements OnInit {
  activeTab: string = 'approve';
  approveList: any[] = [];
  awaitingList: any[] = [];
  loading: boolean = false;

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.fetchApproveList();
    this.fetchAwaitingList();
  }

  fetchApproveList() {
    this.loading = true;
    this.intimationService.getIntimationList().subscribe({
      next: (res) => {
        this.approveList = res.intimations || [];
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch approve list.',
        });
        this.loading = false;
      },
    });
  }

  fetchAwaitingList() {
    this.loading = true;
    this.intimationService.getQaApprovalList().subscribe({
      next: (res) => {
        this.awaitingList = res.intimations || [];
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch awaiting dispatch list.',
        });
        this.loading = false;
      },
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'approve') this.fetchApproveList();
    else this.fetchAwaitingList();
  }

  approveRow(rowData: any, tab: string) {
    let payload: any;
    
    if (tab === 'approve') {
      payload = {
        slip_id: rowData.id,
        stage: 'PRE_QA',
      };
    } else {
      payload = {
        slip_id: rowData.id,
        stage: 'FINAL_QA',
        qa_status: 'APPROVED',
        remarks: 'Parts OK'
      };
    }

    this.intimationService.approveIntimation(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Approved',
          detail: res.message || 'QA verified successfully.',
        });
        if (tab === 'approve') this.fetchApproveList();
        else this.fetchAwaitingList();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve intimation.',
        });
      },
    });
  }
}

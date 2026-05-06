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
  qualityData: any[] = [];
  loading: boolean = true;

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.intimationService.getIntimationList().subscribe({
      next: (res) => {
        this.qualityData = res.intimations || [];
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch intimation list.',
        });
        this.loading = false;
        console.error('Error fetching list:', err);
      },
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  approveRow(rowData: any) {
    const payload = {
      slip_id: rowData.id,
      stage: 'PRE_QA',
    };

    this.intimationService.approveIntimation(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Approved',
          detail: res.message || 'QA verified successfully.',
        });
        // Refresh the list after approval
        this.fetchData();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve intimation.',
        });
        console.error('Error approving intimation:', err);
      },
    });
  }
}

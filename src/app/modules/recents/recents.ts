import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-recents',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, TooltipModule],
  providers: [DatePipe, MessageService],
  templateUrl: './recents.html',
  styleUrl: './recents.scss',
})
export class Recents implements OnInit {
  recentActivityList: any[] = [];
  loading: boolean = false;
  displayReportModal: boolean = false;
  selectedReport: any = null;

  hasValue(val: any): boolean {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed !== '' && trimmed.toLowerCase() !== 'none' && trimmed.toLowerCase() !== 'null';
    }
    return true;
  }

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.fetchRecentActivity();
  }

  fetchRecentActivity() {
    this.loading = true;
    this.intimationService.getRecentActivity().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.recentActivityList = [...(res.intimations || [])];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch recent activity list.',
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  viewReport(item: any) {
    if (item.status?.toUpperCase() !== 'CLOSED') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Report is only available for closed activities.',
      });
      return;
    }

    this.loading = true;
    this.intimationService.getMaintenanceReport(item.id).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.selectedReport = res;
          this.displayReportModal = true;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch the maintenance report.',
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  downloadPDF() {
    window.print();
  }
}

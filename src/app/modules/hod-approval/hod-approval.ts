import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Intimation } from '../../core/services/intimation';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hod-approval',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, DialogModule, TextareaModule, FormsModule],
  providers: [MessageService],
  templateUrl: './hod-approval.html',
  styleUrl: './hod-approval.scss',
})
export class HodApproval implements OnInit {
  approvalList: any[] = [];
  loading: boolean = false;

  // Remarks Popup
  showRemarksPopup: boolean = false;
  approvalRemarks: string = '';
  selectedItem: any = null;

  constructor(
    private intimationService: Intimation,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.fetchApprovalList();
  }

  fetchApprovalList() {
    this.loading = true;
    this.intimationService.getImgApprovalList().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.approvalList = res.intimations || [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error fetching IMG approval list', err);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  approveItem(item: any) {
    this.selectedItem = item;
    this.approvalRemarks = 'Approved for QA verification';
    this.showRemarksPopup = true;
  }

  confirmApproval() {
    if (!this.selectedItem) return;

    const payload = {
      slip_id: this.selectedItem.id,
      stage: 'HOD',
      remarks: this.approvalRemarks || 'Approved for QA verification'
    };

    this.loading = true;
    this.intimationService.approveHOD(payload).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Approved',
            detail: 'HOD Approval successful'
          });
          this.showRemarksPopup = false;
          this.fetchApprovalList();
        });
      },
      error: (err) => {
        console.error('Error approving item', err);
        this.zone.run(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to approve item'
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'REQUESTED': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      default: return 'secondary';
    }
  }
}

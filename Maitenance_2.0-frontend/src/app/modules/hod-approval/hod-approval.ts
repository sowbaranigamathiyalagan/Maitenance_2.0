import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Intimation } from '../../core/services/intimation';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-hod-approval',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './hod-approval.html',
  styleUrl: './hod-approval.scss',
})
export class HodApproval implements OnInit {
  approvalList: any[] = [];
  loading: boolean = false;

  constructor(
    private intimationService: Intimation,
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
    const payload = {
      slip_id: item.id,
      stage: 'HOD',
      remarks: 'Approved for QA verification'
    };

    this.loading = true;
    this.intimationService.approveHOD(payload).subscribe({
      next: (res) => {
        console.log('Approved successfully', res);
        this.fetchApprovalList();
      },
      error: (err) => {
        console.error('Error approving item', err);
        this.zone.run(() => {
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

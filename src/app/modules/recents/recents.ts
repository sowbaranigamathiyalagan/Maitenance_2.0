import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-recents',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  providers: [DatePipe, MessageService],
  templateUrl: './recents.html',
  styleUrl: './recents.scss',
})
export class Recents implements OnInit {
  recentActivityList: any[] = [];
  loading: boolean = false;

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
}

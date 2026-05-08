import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Intimation as IntimationService } from '../../../../core/services/intimation';

@Component({
  selector: 'app-toolbox-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbox-list.html',
  styleUrls: ['./toolbox-list.scss']
})
export class ToolboxListComponent implements OnInit {
  toolboxes: any[] = [];
  loading: boolean = false;
  hasError: boolean = false;
  currentPage = 1;
  pageSize = 15;
  filterStatus: string = 'all';
  filterLocation: string = 'all';

  constructor(
    private intimationService: IntimationService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.fetchToolStatus();
  }

  fetchToolStatus() {
    this.loading = true;
    this.hasError = false;
    this.intimationService.getToolStatus().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.toolboxes = res.tooldata || [];
          this.loading = false;
          this.hasError = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Failed to fetch tool status', err);
        this.zone.run(() => {
          this.loading = false;
          this.hasError = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get filteredToolboxes() {
  if (!this.toolboxes) return [];

  return this.toolboxes.filter(box => {

    const statusMatch =
      this.filterStatus === 'all' ||
      (box.status &&
        box.status.toLowerCase() === this.filterStatus.toLowerCase());

    const locationMatch =
      this.filterLocation === 'all' ||
      (box.location &&
        box.location.toLowerCase() === this.filterLocation.toLowerCase());

    return statusMatch && locationMatch;
  });
}

  getStatusClass(status: string) {
    return {
      critical: status === 'critical',
      warning: status === 'warning',
      ok: status === 'ok'
    };
  }

  get paginatedData() {
    const data = this.filteredToolboxes;
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get pages() {
    const totalItems = this.filteredToolboxes.length;
    return Array(Math.ceil(totalItems / this.pageSize))
      .fill(0)
      .map((_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.pages.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
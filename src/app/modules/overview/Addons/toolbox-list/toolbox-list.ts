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
  loading = false;
  hasError = false;
  currentPage = 1;
  pageSize = 15;
  filterStatus = 'all';
  filterLocation = 'all';
  searchQuery = '';
  selectedTool: any = null;
  showFlowModal = false;
  flowLoading = false;
  toolFlowInfo: any = null;

  readonly FLOW_STEPS = [
    { key: 'NONE',         label: 'Intimation Created', dept: '' },
    { key: 'QA_APPROVAL',  label: 'QA Approval',        dept: 'QA' },
    { key: 'CHECK_IN',     label: 'Check In',           dept: 'TOOLING' },
    { key: 'CHECK_OUT',    label: 'Check Out',          dept: 'TOOLING' },
    { key: 'IMG_APPROVAL', label: 'IMG Approval',       dept: 'IMG' },
    { key: 'QA_CLOSURE',   label: 'QA Closure',         dept: 'QA' },
  ];

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
    const query = this.searchQuery.trim().toLowerCase();
    return this.toolboxes.filter(box => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (box.status && box.status.toLowerCase() === this.filterStatus.toLowerCase());
      const locationMatch =
        this.filterLocation === 'all' ||
        (box.location && box.location.toLowerCase() === this.filterLocation.toLowerCase());
      const searchMatch =
        !query ||
        (box.name && box.name.toLowerCase().includes(query)) ||
        (box.code && box.code.toLowerCase().includes(query));
      return statusMatch && locationMatch && searchMatch;
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

  goToPage(page: number) { this.currentPage = page; }

  nextPage() {
    if (this.currentPage < this.pages.length) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  openFlowModal(box: any) {
    this.selectedTool = box;
    this.showFlowModal = true;
    this.flowLoading = true;
    this.toolFlowInfo = null;
    this.intimationService.getToolInfo(box.name).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.toolFlowInfo = res;
          this.flowLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.flowLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  closeFlowModal() {
    this.selectedTool = null;
    this.showFlowModal = false;
    this.toolFlowInfo = null;
  }

  getStepState(stepKey: string): 'done' | 'active' | 'pending' {
    if (!this.toolFlowInfo) return 'pending';
    const suggestedAction = this.toolFlowInfo.suggested_action;
    const slipStatus = this.toolFlowInfo.slip_status;
    if (!suggestedAction || slipStatus === null) {
      return stepKey === 'NONE' ? 'active' : 'pending';
    }
    const keys = this.FLOW_STEPS.map(s => s.key);
    const activeIdx = keys.indexOf(suggestedAction);
    const stepIdx = keys.indexOf(stepKey);
    if (stepIdx < activeIdx) return 'done';
    if (stepIdx === activeIdx) return 'active';
    return 'pending';
  }

}
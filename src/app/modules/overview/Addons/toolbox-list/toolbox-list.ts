import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Intimation as IntimationService } from '../../../../core/services/intimation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbox-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbox-list.html',
  styleUrls: ['./toolbox-list.scss']
})
export class ToolboxListComponent implements OnInit, OnDestroy {

  toolboxes: any[] = [];
  loading = false;
  hasError = false;
  currentPage = 1;
  pageSize = 15;
  filterStatus = 'all';
  filterLocation = 'all';
  filterCategory = 'all';
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
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchToolStatus();
  }

  ngOnDestroy() {
    document.documentElement.style.removeProperty('--status-tint');
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
          this.updateBackgroundTint();
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
      const categoryMatch =
        this.filterCategory === 'all' ||
        (box.maint_category && box.maint_category.toLowerCase() === this.filterCategory.toLowerCase());
      const searchMatch =
        !query ||
        (box.name && box.name.toLowerCase().includes(query)) ||
        (box.code && box.code.toLowerCase().includes(query));
      return statusMatch && locationMatch && categoryMatch && searchMatch;
    });
  }

  getStatusClass(status: string) {
    return {
      critical: status === 'critical',
      warning: status === 'warning',
      ok: status === 'ok'
    };
  }

  updateBackgroundTint() {
    if (!this.toolboxes || this.toolboxes.length === 0) {
      document.documentElement.style.removeProperty('--status-tint');
      return;
    }
    
    const hasCritical = this.toolboxes.some(t => t.status === 'critical');
    const hasWarning = this.toolboxes.some(t => t.status === 'warning');
    
    let tint = 'transparent';
    if (hasCritical) {
      tint = 'rgba(220, 38, 38, 0.08)'; // Subtle red
    } else if (hasWarning) {
      tint = 'rgba(234, 88, 12, 0.08)'; // Subtle orange/yellow
    } else {
      tint = 'rgba(22, 163, 74, 0.08)'; // Subtle green
    }
    document.documentElement.style.setProperty('--status-tint', tint);
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

  viewInScanner(box: any) {
    if (box && box.name) {
      this.router.navigate(['/scanner'], { queryParams: { toolCode: box.name } });
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    let relativePath = imagePath;
    const mediaIdx = imagePath.indexOf('/media/');
    if (mediaIdx > -1) {
      relativePath = imagePath.substring(mediaIdx);
    }
    return this.intimationService.baseUrl + relativePath;
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
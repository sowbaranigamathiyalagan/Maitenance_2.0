import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    RadioButtonModule,
    TextareaModule,
  ],
  providers: [DatePipe],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss',
})
export class Scanner {
  scannerInput: string = '';
  showDetails: boolean = false;
  loading: boolean = false;
  toolInfo: any = null;

  // Checklist Modal
  showChecklistModal: boolean = false;
  checklistData: any = null;
  checklistSource: string = '';

  // Action Update Modal
  showActionModal: boolean = false;
  actionData: any = {
    inspection_remarks: '',
    repaired_by: '',
    problem_cause: '',
    corrective_action: '',
    broken_parts: [],
  };

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService
  ) {
    this.actionData.broken_parts = [this.createNewBrokenPart()];
  }

  onSend() {
    if (!this.scannerInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a tool code.',
      });
      return;
    }

    this.loading = true;
    this.intimationService.getToolInfo(this.scannerInput.trim()).subscribe({
      next: (res) => {
        this.toolInfo = res;
        this.showDetails = true;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Tool Found',
          detail: `Information for ${this.scannerInput} loaded.`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch tool information.',
        });
        this.showDetails = false;
        this.loading = false;
      },
    });
  }

  onCheckIn() {
    const payload = {
      tool: this.toolInfo.tool_code,
      session_id: this.toolInfo.session_id,
      slip_id: this.toolInfo.slip_id,
    };

    this.intimationService.checkInTool(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Check-in successful.',
        });
        this.resetPage();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Check-in failed.',
        });
      },
    });
  }

  onCheckOut() {
    this.fetchChecklist();
  }

  fetchChecklist() {
    this.intimationService
      .getChecklistTemplate(this.toolInfo.tool_code)
      .subscribe({
        next: (res) => {
          this.checklistData = res;
          this.checklistSource = res.checklist_source;
          // Ensure observation is set
          if (this.checklistData.check_items) {
            this.checklistData.check_items.forEach((item: any) => {
              if (!item.observation) item.observation = 'OK';
            });
          }
          this.showChecklistModal = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Checklist Ready',
            detail: 'Please complete the inspection items.',
          });
        },error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch checklist.',
          });
        }
      });
  }

  submitChecklist() {
    const payload = {
      slip_id: this.toolInfo.intimation_id,
      checklist: this.checklistData.check_items.map((item: any) => ({
        item_name: item.check_item,
        observation: item.observation,
        remarks: item.remarks || '',
      })),
    };

    this.intimationService.submitChecklist(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Checklist Submitted',
          detail: 'Proceeding to action taken form.',
        });
        this.showChecklistModal = false;
        this.openActionModal();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit checklist.',
        });
      },
    });
  }

  openActionModal() {
    this.showActionModal = true;
  }

  createNewBrokenPart() {
    return {
      mold_part_name: '',
      pole_no: '',
      part_number: '',
      cavity_no: '',
      total_parts_broken: null,
    };
  }

  addBrokenPart() {
    this.actionData.broken_parts.push(this.createNewBrokenPart());
  }

  removeBrokenPart(index: number) {
    if (this.actionData.broken_parts.length > 1) {
      this.actionData.broken_parts.splice(index, 1);
    }
  }

  submitActionUpdate() {
    const payload = {
      slip_id: this.toolInfo.intimation_id,
      ...this.actionData,
    };

    this.intimationService.submitActionUpdate(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Check-out completed successfully.',
        });
        this.showActionModal = false;
        this.resetPage();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to complete check-out.',
        });
      },
    });
  }

  resetPage() {
    this.scannerInput = '';
    this.showDetails = false;
    this.toolInfo = null;
    this.actionData = {
      inspection_remarks: '',
      repaired_by: '',
      problem_cause: '',
      corrective_action: '',
      broken_parts: [this.createNewBrokenPart()],
    };
  }

  downloadChecksheet() {
    if (this.toolInfo?.last_pm_checksheet) {
        window.open(this.toolInfo.last_pm_checksheet, '_blank');
    }
  }
}

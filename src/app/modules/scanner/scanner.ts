import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';
import { IntimationSlip } from '../../components/intimation-slip/intimation-slip';

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
    SelectModule,
    TabsModule,
    IntimationSlip,
  ],
  providers: [DatePipe],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss',
})
export class Scanner implements AfterViewInit {
  @ViewChild('scannerInputField') scannerInputField!: ElementRef;
  @ViewChild('markingSheetInput') markingSheetInput!: ElementRef;

  scannerInput: string = '';
  showDetails: boolean = false;
  loading: boolean = false;
  toolInfo: any = null;

  visibleSlip: boolean = false;

  // Checklist Modal
  showChecklistModal: boolean = false;
  checklistData: any = null;
  checklistSource: string = '';

  // Remarks Popup (triggered when NOT_OK is selected)
  showRemarksPopup: boolean = false;
  activeRemarkItem: any = null;
  tempRemark: string = '';

  // Action Update Modal
  showActionModal: boolean = false;
  submittingCheckOut: boolean = false;
  markingSheetFile: File | null = null;
  activeActionTabIndex: string = '0';
  sparesList: any[] = [];
  sparesLoaded: boolean = false;

  actionData: any = {
    inspection_remarks: '',
    repaired_by: '',
    problem_cause: '',
    corrective_action: '',
    broken_parts: [],
    spares_consumed: [],
  };

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService
  ) {
    this.actionData.broken_parts = [this.createNewBrokenPart()];
    this.actionData.spares_consumed = [this.createNewSpare()];
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  focusInput() {
    if (this.scannerInputField) {
      setTimeout(() => {
        this.scannerInputField.nativeElement.focus();
      }, 0);
    }
  }

  showSlip() {
    this.visibleSlip = true;
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
        this.scannerInput = ''; // Clear input on success
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch tool information.',
        });
        this.scannerInput = ''; // Clear input on error
        this.showDetails = false;
        this.loading = false;
        this.focusInput();
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

  onImageSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: 'Image size must be less than 5MB.'
      });
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Format',
        detail: 'Only .jpeg, .jpg, and .png formats are allowed.'
      });
      return;
    }

    this.messageService.add({ severity: 'info', summary: 'Uploading...', detail: 'Please wait' });
    this.intimationService.uploadToolImage(this.toolInfo.tool_code, file).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Complete',
          detail: 'Tool image updated successfully.'
        });
        
        // Refresh the tool info to get the new image URL (or use a returned URL)
        // Let's just fetch tool info again to keep it simple and ensure data consistency
        this.intimationService.getToolInfo(this.toolInfo.tool_code).subscribe(newInfo => {
          this.toolInfo = newInfo;
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Could not upload the image.'
        });
      }
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

  onObservationChange(item: any, value: string) {
    item.observation = value;
    if (value === 'NOT_OK') {
      this.activeRemarkItem = item;
      this.tempRemark = item.remarks || '';
      this.showRemarksPopup = true;
    }
  }

  saveRemark() {
    if (this.activeRemarkItem) {
      this.activeRemarkItem.remarks = this.tempRemark;
    }
    this.showRemarksPopup = false;
    this.activeRemarkItem = null;
    this.tempRemark = '';
  }

  cancelRemark() {
    if (this.activeRemarkItem) {
      // Revert to OK if user cancels without entering a remark
      this.activeRemarkItem.observation = 'OK';
    }
    this.showRemarksPopup = false;
    this.activeRemarkItem = null;
    this.tempRemark = '';
  }

  proceedToActionModal() {
    this.showChecklistModal = false;
    this.openActionModal();
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

  createNewSpare() {
    return {
      itemcode: null,
      quantity: null,
    };
  }

  addSpare() {
    this.actionData.spares_consumed.push(this.createNewSpare());
  }

  removeSpare(index: number) {
    if (this.actionData.spares_consumed.length > 1) {
      this.actionData.spares_consumed.splice(index, 1);
    }
  }

  onActionTabChange(value: any) {
    if ((value === '1' || value === 1) && !this.sparesLoaded) {
      this.loadSpares();
    }
  }

  loadSpares() {
    this.intimationService.getSpares().subscribe({
      next: (res: any) => {
        console.log('Spares loaded:', res);
        this.sparesList = Array.isArray(res) ? res : (res?.data || res?.spares || res?.message || []);
        this.sparesLoaded = true;
      },
      error: (err) => {
        console.error('Error fetching spares:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load spares list.',
        });
      }
    });
  }

  onMarkingSheetSelect(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.markingSheetFile = file;
    }
  }

  clearMarkingSheet() {
    this.markingSheetFile = null;
    if (this.markingSheetInput && this.markingSheetInput.nativeElement) {
      this.markingSheetInput.nativeElement.value = '';
    }
  }

  submitCombinedCheckOut() {
    // Validate main action fields
    const { inspection_remarks, repaired_by, problem_cause, corrective_action } = this.actionData;
    if (!inspection_remarks?.trim() || !repaired_by?.trim() || !problem_cause?.trim() || !corrective_action?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required Fields',
        detail: 'Please fill in all the required text fields.',
      });
      return;
    }

    if (!this.markingSheetFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required',
        detail: 'Please upload the Marking Sheet before submitting.',
      });
      return;
    }

    this.submittingCheckOut = true;

    // 1. Build Checklist Payload as FormData
    const checklistPayload = new FormData();
    checklistPayload.append('slip_id', this.toolInfo.slip_id);
    
    const checklistItems = this.checklistData.check_items
      .filter((item: any) => item.observation !== 'NA')
      .map((item: any) => ({
        item_name: item.check_item,
        observation: item.observation,
        remarks: item.remarks || '',
      }));
    
    checklistPayload.append('checklist', JSON.stringify(checklistItems));
    checklistPayload.append('sheet', this.markingSheetFile);

    // 2. Build Action Payload
    const validBrokenParts = this.actionData.broken_parts.filter((p: any) => p.part_number && p.mold_part_name);
    const validSpares = this.actionData.spares_consumed.filter((s: any) => s.itemcode && s.quantity > 0);

    const actionPayload = {
      slip_id: this.toolInfo.slip_id,
      ...this.actionData,
      broken_parts: validBrokenParts,
      spares_consumed: validSpares,
    };

    // Sequentially execute: Checklist first, then Action Update
    this.intimationService.submitChecklist(checklistPayload).subscribe({
      next: () => {
        this.intimationService.submitActionUpdate(actionPayload).subscribe({
          next: () => {
            this.submittingCheckOut = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Check-out completed successfully.',
            });
            this.showActionModal = false;
            this.resetPage();
          },
          error: () => {
            this.submittingCheckOut = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to submit action update.',
            });
          }
        });
      },
      error: () => {
        this.submittingCheckOut = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit checklist data.',
        });
      }
    });
  }

  resetPage() {
    this.scannerInput = '';
    this.showDetails = false;
    this.toolInfo = null;
    this.clearMarkingSheet();
    this.sparesLoaded = false;
    this.activeActionTabIndex = '0';
    this.actionData = {
      inspection_remarks: '',
      repaired_by: '',
      problem_cause: '',
      corrective_action: '',
      broken_parts: [this.createNewBrokenPart()],
      spares_consumed: [this.createNewSpare()],
    };
    this.focusInput();
  }

  downloadChecksheet() {
    if (this.toolInfo?.last_pm_checksheet) {
        window.open(this.toolInfo.last_pm_checksheet, '_blank');
    }
  }
}

import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-intimation-slip',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './intimation-slip.html',
  styleUrl: './intimation-slip.scss',
})
export class IntimationSlip implements OnInit {
  @Input() autofillData: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<any>();

  formData: any = {
    machineNumber: '',
    moldNumber: '',
    moldName: '',
    shotsProduced: null,
    standardShots: null,
    timeDuration: '',
    materialName: null,
    shift: null,
    department: null,
    category: null,
    problemDesc: '',
  };

  categories = [
    { label: 'Break Down', value: 'BD' },
    { label: 'Repair', value: 'REPAIR' },
    { label: 'Modify', value: 'MODIFY' },
  ];

  savedDescriptions: any[] = [];
  selectedSavedDescription: any = null;

  shifts = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
  ];

  departments = [
    { label: 'TOOLING', value: 'TOOLING' },
    { label: 'ENGINEERING', value: 'ENGINEERING' },
    { label: 'MAINTENANCE', value: 'MAINTENANCE' },
    { label: 'PPC', value: 'PPC' },
    { label: 'QA', value: 'QA' },
    { label: 'MARKENTING', value: 'MARKENTING' },
    { label: 'IMG', value: 'IMG' },
  ];

  materials = [
    { label: 'ABS', value: 'ABS' },
    { label: 'Polycarbonate (PC)', value: 'PC' },
    { label: 'Polypropylene (PP)', value: 'PP' },
    { label: 'Nylon (PA)', value: 'PA' },
    { label: 'Delrin (POM)', value: 'POM' },
  ];

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.autofillData) {
      this.formData.moldNumber = this.autofillData.tool_code || '';
      this.formData.moldName = this.autofillData.toolName || '';
      if (this.autofillData.shift_code) {
        this.formData.shift = this.shifts.find(s => s.value === this.autofillData.shift_code) || null;
      }
      this.formData.timeDuration = '3';
    }
  }

  close() {
    this.onClose.emit();
  }

  validateForm(): boolean {
    const requiredFields = [
      'machineNumber',
      'moldNumber',
      'moldName',
      'timeDuration',
      'materialName',
      'shift',
      'department',
      'category',
    ];

    for (const field of requiredFields) {
      const value = this.formData[field];
      if (value === null || value === undefined || value === '') {
        return false;
      }
    }
    return true;
  }

  send() {
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all mandatory fields.',
      });
      return;
    }

    const payload = {
      machine_no: this.formData.machineNumber,
      mold_no: this.formData.moldNumber,
      mold_name: this.formData.moldName,
      no_of_shots_produced: Number(this.formData.shotsProduced),
      standard_shots: Number(this.formData.standardShots),
      time_duration: this.formData.timeDuration,
      material_name: this.formData.materialName?.value || '',
      shift: this.formData.shift?.value || '',
      dept: this.formData.department.value,
      category: this.formData.category.value,
      problem_observed: this.formData.problemDesc,
    };

    this.intimationService.createIntimation(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Intimation Slip created successfully.',
        });
        this.onSend.emit(res);
        this.close();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create Intimation Slip.',
        });
        console.error('Error creating intimation:', err);
      },
    });
  }

  onCategoryChange() {
    this.savedDescriptions = [];
    this.selectedSavedDescription = null;
    
    if (this.formData.category) {
      this.intimationService.getProblemDescriptions().subscribe({
        next: (res) => {
          const data = Array.isArray(res) ? res : (res.data || []);
          const selectedValue = this.formData.category.value; // 'PM', 'BD', etc.
          const selectedLabel = this.formData.category.label; // 'Prev. Maint', 'Break Down', etc.
          
          // Try to find a matching type from the response
          // e.g., if value is 'PM', it might match 'PrevMaint' (user example) or 'PM'
          const matchingGroup = data.find((group: any) => {
            const t = group.type || '';
            return t === selectedValue || 
                   t === selectedLabel || 
                   (selectedValue === 'PM' && t === 'PrevMaint') ||
                   (selectedValue === 'BD' && t === 'BreakDown');
          });

          if (matchingGroup && matchingGroup.reasons && Array.isArray(matchingGroup.reasons)) {
            // Map strings to objects so p-select optionLabel="description" works
            this.savedDescriptions = matchingGroup.reasons.map((r: string) => ({ description: r }));
          } else {
            this.savedDescriptions = [];
          }
        },
        error: (err) => {
          console.error('Error fetching descriptions:', err);
        }
      });
    }
  }

  onSavedDescChange() {
    if (this.selectedSavedDescription) {
      // Append or replace? Usually replace is better or if empty
      // We will replace the current description with the selected one
      this.formData.problemDesc = this.selectedSavedDescription.description;
    }
  }

  saveDescription() {
    if (!this.formData.category) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Category', detail: 'Please select a category first.' });
      return;
    }
    
    const descText = this.formData.problemDesc?.trim();
    if (!descText) {
      this.messageService.add({ severity: 'warn', summary: 'Empty Description', detail: 'Please enter a description to save.' });
      return;
    }

    // Duplicate Check
    const isDuplicate = this.savedDescriptions.some(item => item.description.toLowerCase() === descText.toLowerCase());
    if (isDuplicate) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'This description is already saved for this category.' });
      return;
    }

    const payload = {
      category: this.formData.category.value,
      description: descText
    };

    this.intimationService.saveProblemDescription(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Description saved for future use.' });
        // Refresh the list
        this.onCategoryChange();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save description.' });
      }
    });
  }

  deleteDescription() {
    if (!this.formData.category) return;
    if (!this.selectedSavedDescription) return;

    let mappedCategory = this.formData.category.value;
    // if (mappedCategory === 'PM') mappedCategory = 'PrevMaint';
    // if (mappedCategory === 'BD') mappedCategory = 'BreakDown';

    const payload = {
      category: mappedCategory,
      description: this.selectedSavedDescription.description
    };

    this.intimationService.deleteProblemDescription(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Description deleted successfully.' });
        this.selectedSavedDescription = null;
        this.onCategoryChange();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete description.' });
      }
    });
  }
}

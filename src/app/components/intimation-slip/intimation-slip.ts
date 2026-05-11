import { Component, EventEmitter, Output } from '@angular/core';
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
export class IntimationSlip {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<any>();

  formData: any = {
    machineNumber: '',
    moldNumber: '',
    moldName: '',
    shotsProduced: null,
    standardShots: null,
    timeDuration: '',
    materialName: '',
    shift: null,
    department: null,
    category: null,
    problemDesc: '',
  };

  categories = [
    { label: 'Prev. Maint', value: 'PM' },
    { label: 'Break Down', value: 'BD' },
    { label: 'Repair', value: 'REPAIR' },
    { label: 'Modify', value: 'MODIFY' },
  ];

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

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService
  ) {}

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
      'problemDesc',
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
      material_name: this.formData.materialName,
      shift: this.formData.shift.value,
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
}

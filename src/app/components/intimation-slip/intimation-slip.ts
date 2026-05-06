import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

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
    moldName: '',
    category: null,
    materialName: '',
    shift: null,
    department: null,
    problemDesc: '',
  };

  categories = [
    { label: 'Prev. Maint', value: 'Prev. Maint' },
    { label: 'Break Down', value: 'Break Down' },
    { label: 'Repair', value: 'Repair' },
    { label: 'Modify', value: 'Modify' },
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

  close() {
    this.onClose.emit();
  }

  send() {
    this.onSend.emit(this.formData);
  }
}

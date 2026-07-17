import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SharedModule, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { Intimation as IntimationService } from '../../core/services/intimation';

interface CalendarDay {
  dayNumber: number | null;
  events: any[];
  isToday: boolean;
}

@Component({
  selector: 'app-pm-schedule',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
    InputTextModule,
    FormsModule,
    SharedModule,
    ToastModule,
    RouterModule
  ],
  providers: [DatePipe, MessageService],
  templateUrl: './pm-schedule.html',
  styleUrl: './pm-schedule.scss'
})
export class PMSchedule implements OnInit {
  schedules: any[] = [];
  loading: boolean = false;
  activeTab: 'grid' | 'calendar' = 'calendar';

  // Date selection
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  activePeriods: { year: number, month: number }[] = [];
  allMonths = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  months: any[] = [];
  years: number[] = [];
  calendarDays: CalendarDay[] = [];

  // Manual Add Modal
  showAddModal: boolean = false;
  newSchedule = {
    tool_code: '',
    planned_date: '',
    customer: 'MATE',
    machine_tonnage: '',
    req_hours: null as number | null,
    remark: ''
  };

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadActiveDates();
  }

  loadActiveDates(targetMonth?: number, targetYear?: number) {
    this.loading = true;
    this.intimationService.getPMActiveDates().subscribe({
      next: (res: any) => {
        this.years = res.years || [];
        this.activePeriods = res.active_periods || [];
        
        if (targetYear !== undefined && targetMonth !== undefined) {
          this.selectedYear = targetYear;
          this.selectedMonth = targetMonth;
        } else {
          // If current year is in list of years, default to it
          const currentYear = new Date().getFullYear();
          if (this.years.includes(currentYear)) {
            this.selectedYear = currentYear;
          } else if (this.years.length > 0) {
            this.selectedYear = this.years[0];
          }
        }
        
        this.updateAvailableMonths();
        this.loadSchedules();
      },
      error: (err) => {
        console.error(err);
        this.years = [new Date().getFullYear()];
        this.months = [...this.allMonths];
        this.loadSchedules();
      }
    });
  }

  updateAvailableMonths() {
    const activeMonths = this.activePeriods
      .filter(p => Number(p.year) === Number(this.selectedYear))
      .map(p => Number(p.month));
      
    this.months = this.allMonths.filter(m => activeMonths.includes(m.value));
    
    if (this.months.length === 0) {
      this.months = [...this.allMonths];
    }
    
    const hasSelectedMonth = this.months.some(m => Number(m.value) === Number(this.selectedMonth));
    if (!hasSelectedMonth && this.months.length > 0) {
      this.selectedMonth = this.months[0].value;
    }
  }

  onYearChange() {
    this.updateAvailableMonths();
    this.loadSchedules();
  }

  loadSchedules() {
    this.loading = true;
    this.intimationService.getPMSchedules(this.selectedMonth, this.selectedYear).subscribe({
      next: (res: any[]) => {
        this.schedules = res;
        this.generateCalendar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Unable to fetch PM schedules.'
        });
        this.loading = false;
      }
    });
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.selectedYear;
    const month = this.selectedMonth - 1; // 0-indexed in JS Date

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();

    // 1. Add padding days for start of month
    for (let i = 0; i < startOffset; i++) {
      this.calendarDays.push({ dayNumber: null, events: [], isToday: false });
    }

    // 2. Add days of the month
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      
      // Filter events planned for this specific day
      const dayEvents = this.schedules.filter(item => {
        if (!item.planned_date) return false;
        // Parse planned_date (string "YYYY-MM-DD")
        const dateParts = item.planned_date.split('-');
        if (dateParts.length !== 3) return false;
        const pYear = parseInt(dateParts[0]);
        const pMonth = parseInt(dateParts[1]) - 1;
        const pDay = parseInt(dateParts[2]);
        return pDay === d && pMonth === Number(month) && pYear === Number(year);
      });

      this.calendarDays.push({
        dayNumber: d,
        events: dayEvents,
        isToday: isToday
      });
    }

    // 3. Add padding days for the end of the month
    const totalCells = this.calendarDays.length;
    const endOffset = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < endOffset; i++) {
      this.calendarDays.push({ dayNumber: null, events: [], isToday: false });
    }
  }

  downloadTemplate() {
    const url = '/assets/templates/Monthy_PM_Plan_Work_Sheet.xlsx';
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Monthy_PM_Plan_Work_Sheet.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Template Download',
      detail: 'PM Excel template download triggered.'
    });
  }

  onUploadExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.loading = true;
    this.intimationService.uploadPMSchedule(file, this.selectedMonth, this.selectedYear).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Import Success',
          detail: res.message || 'PM schedule imported successfully.'
        });
        
        // Focus on the imported year and month
        if (res.year && res.month) {
          this.loadActiveDates(Number(res.month), Number(res.year));
        } else {
          this.loadActiveDates();
        }
      },
      error: (err) => {
        console.error(err);
        const errMsg = err.error?.error || 'Failed to parse Excel file.';
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: errMsg
        });
        this.loading = false;
      }
    });
    event.target.value = '';
  }

  openAddModal() {
    this.newSchedule = {
      tool_code: '',
      planned_date: `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-01`,
      customer: 'MATE',
      machine_tonnage: '',
      req_hours: null,
      remark: ''
    };
    this.showAddModal = true;
  }

  submitManualPlan() {
    if (!this.newSchedule.tool_code || !this.newSchedule.planned_date) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Tool Code and Planned Date are required.'
      });
      return;
    }

    this.loading = true;
    this.intimationService.addPMScheduleManual(this.newSchedule).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Manual PM schedule added.'
        });
        this.showAddModal = false;
        
        // Focus on the newly added plan's year and month
        if (res.data && res.data.plan_month && res.data.plan_year) {
          this.loadActiveDates(Number(res.data.plan_month), Number(res.data.plan_year));
        } else {
          this.loadActiveDates();
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: err.error?.error || 'Failed to add manual PM plan.'
        });
        this.loading = false;
      }
    });
  }
}

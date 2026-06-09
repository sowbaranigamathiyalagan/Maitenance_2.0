import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Intimation as IntimationService } from '../../core/services/intimation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TableModule, SelectModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  donutData: any;
  donutOptions: any;

  barData: any;
  barOptions: any;

  lineData: any;
  lineOptions: any;

  recentActivity: any[] = [];
  recentTools: any[] = [];

  // Top Metrics
  totalTools: number = 0;
  inMaintenance: number = 0;
  awaiting: number = 0;
  completed: number = 0;
  mttr: number = 0;

  // Chart configuration constants
  cBlue = '#3b82f6';
  cOrange = '#f97316';
  cLightOrange = '#fcd34d';
  cTeal = '#4ade80';
  cRed = '#ef4444';

  // Filter types for the weekly chart
  weeklyFilterOptions = [
    { label: 'TOTAL', value: 'TOTAL' },
    { label: 'PM', value: 'PM' },
    { label: 'BD', value: 'BD' },
    { label: 'REPAIR', value: 'REPAIR' },
    { label: 'MODIFY', value: 'MODIFY' }
  ];
  selectedWeeklyFilter: string = 'TOTAL';

  constructor(private cdr: ChangeDetectorRef, private intimationService: IntimationService) {}

  ngOnInit() {
    this.initChartOptions();
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    forkJoin({
      summary: this.intimationService.getDashboardSummary(),
      toolCount: this.intimationService.getDashboardToolCount(),
      monthlyTrend: this.intimationService.getDashboardMonthlyTrend(),
      recentActivities: this.intimationService.getDashboardRecentActivities(),
      durationReport: this.intimationService.getDashboardMaintenanceDuration(),
      weeklyActivity: this.intimationService.getDashboardWeeklyActivity(this.selectedWeeklyFilter)
    }).subscribe({
      next: (data) => {
        // Summary
        this.totalTools = data.summary.total_tools || 0;
        this.inMaintenance = data.summary.in_maintenance || 0;
        this.awaiting = data.summary.awaiting || 0;
        this.completed = data.summary.completed || 0;
        this.mttr = data.summary.mttr || 0;

        // Tool Count (Donut)
        if (data.toolCount && data.toolCount.distribution) {
          const dist = data.toolCount.distribution;
          this.donutData = {
            labels: dist.map((d: any) => d.label),
            datasets: [{
              data: dist.map((d: any) => d.count),
              backgroundColor: [this.cOrange, this.cLightOrange, this.cBlue, this.cTeal, this.cRed],
              hoverBackgroundColor: [this.cOrange, this.cLightOrange, this.cBlue, this.cTeal, this.cRed],
              borderWidth: 0
            }]
          };
        }

        // Monthly Trend (Bar)
        if (Array.isArray(data.monthlyTrend)) {
          this.barData = {
            labels: data.monthlyTrend.map((d: any) => d.month),
            datasets: [
              {
                label: 'PM',
                data: data.monthlyTrend.map((d: any) => d.PM),
                backgroundColor: this.cBlue,
                borderRadius: 2
              },
              {
                label: 'BD',
                data: data.monthlyTrend.map((d: any) => d.BD),
                backgroundColor: this.cTeal,
                borderRadius: 2
              }
            ]
          };
        }

        // Recent Activities
        if (data.recentActivities && data.recentActivities.activities) {
          this.recentActivity = data.recentActivities.activities;
        }

        // Maintenance Duration Report
        if (data.durationReport && data.durationReport.duration_report) {
          this.recentTools = data.durationReport.duration_report;
        }

        // Weekly Maintenance Activity (Line)
        if (data.weeklyActivity && data.weeklyActivity.activity) {
          this.updateLineChartData(data.weeklyActivity.activity);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      }
    });
  }

  onWeeklyFilterChange() {
    this.intimationService.getDashboardWeeklyActivity(this.selectedWeeklyFilter).subscribe({
      next: (data) => {
        if (data && data.activity) {
          this.updateLineChartData(data.activity);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load weekly activity', err);
      }
    });
  }

  updateLineChartData(activity: any[]) {
    this.lineData = {
      labels: activity.map((d: any) => d.date),
      datasets: [
        {
          label: `Weekly Activity (${this.selectedWeeklyFilter})`,
          data: activity.map((d: any) => d.count),
          fill: true,
          borderColor: this.cRed,
          borderWidth: 3,
          tension: 0.4,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          pointRadius: 5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: this.cRed,
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-main');
    const textColorSecondary = documentStyle.getPropertyValue('--text-muted');
    const surfaceBorder = documentStyle.getPropertyValue('--border-light');

    // Colors matching the user's screenshot
    const cBlue = '#3b82f6'; // Bright blue
    const cOrange = '#f97316'; // Orange
    const cLightOrange = '#fcd34d'; // Yellow/Tan
    const cTeal = '#4ade80'; // Mint/Teal
    const cRed = '#ef4444'; // Red

    this.donutData = {
      labels: ['Preventive Maintenance', 'Breakdown Maintenance', 'Repair'],
      datasets: [
        {
          data: [35, 15, 50],
          backgroundColor: [cOrange, cLightOrange, cBlue],
          hoverBackgroundColor: [cOrange, cLightOrange, cBlue],
          borderWidth: 0
        }
      ]
    };

    this.donutOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { 
            color: textColor, 
            usePointStyle: true, 
            font: { family: "Inter", weight: "500", size: 12 } 
          }
        }
      },
      cutout: '45%'
    };

    // Alternate colors for bar chart: blue, teal, blue, teal...
    const barColors = Array.from({length: 10}).map((_, i) => i % 2 === 0 ? cBlue : cTeal);

    this.barData = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datasets: [
        {
          label: 'Trend',
          data: [70, 92, 62, 110, 122, 66, 78, 66, 70, 95],
          backgroundColor: barColors,
          borderRadius: 2
        }
      ]
    };

    this.barOptions = {
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: true,
          position: 'top',
          labels: { color: textColor }
        } 
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { display: false } },
        y: { ticks: { color: textColorSecondary, stepSize: 20 }, grid: { color: surfaceBorder } }
      }
    };

    this.lineData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Weekly Maintenance',
          data: [4000, 2000, 400, 800, 500, 1500, 2500, 1900],
          fill: true,
          borderColor: cRed,
          borderWidth: 3,
          tension: 0.4,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          pointRadius: 5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: cRed,
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }
      ]
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      layout: {
        padding: { top: 10 }
      },
      plugins: { legend: { display: false } },
      scales: {
        x: { 
          display: true, 
          ticks: { color: textColorSecondary, font: { weight: '600' } },
          grid: { display: false } 
        },
        y: { 
          beginAtZero: true,
          suggestedMax: 5,
          ticks: { 
            color: textColorSecondary,
            stepSize: 1,
            font: { weight: '600' }
          }, 
          border: { display: false },
          grid: { color: surfaceBorder, drawBorder: false } 
        }
      }
    };
  }
}

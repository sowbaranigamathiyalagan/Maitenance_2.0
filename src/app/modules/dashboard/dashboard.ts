import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, TableModule],
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

  recentActivity = [
    { toolCode: 'T0025', action: 'Checked in for Preventive Maintenance', date: '02/04/25' },
    { toolCode: 'T0026', action: 'Checked in for Breakdown', date: '01/03/25' },
    { toolCode: 'T0027', action: 'Requested for P/M', date: '03/02/25' },
    { toolCode: 'T0028', action: 'Requested for B/M', date: '05/02/25' },
    { toolCode: 'T0029', action: 'Checked in for Breakdown Maintenance', date: '05/04/25' },
    { toolCode: 'T0020', action: 'Checked in PM', date: '05/02/25' }
  ];

  recentTools = [
    { tool: 'T0015', status: 'Requested', category: 'PM', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' },
    { tool: 'T0018', status: 'Completed', category: 'B/D', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' },
    { tool: 'T0095', status: 'Rejected', category: 'Repair', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' },
    { tool: 'T0010', status: 'In Progress', category: 'B/D', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' },
    { tool: 'T0016', status: 'Completed', category: 'Repair', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' },
    { tool: 'T0014', status: 'Rejected', category: 'PM', checkIn: '10/11/25', checkOut: '12/11/25', duration: '1 day' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initCharts();
    
    // Sometimes Chart.js needs a tick to render properly in PrimeNG standalone
    setTimeout(() => {
      this.initCharts();
      this.cdr.detectChanges();
    }, 100);
  }

  initCharts() {
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
      plugins: { legend: { display: false } },
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
          tension: 0.1, // angular lines in the screenshot, not smooth
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          pointRadius: 0
        }
      ]
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false, grid: { display: false } },
        y: { 
          ticks: { 
            color: textColorSecondary, 
            callback: (v: any) => v === 0 ? '0' : (v / 1000) + 'k',
            stepSize: 1000
          }, 
          grid: { color: surfaceBorder } 
        }
      }
    };
  }
}

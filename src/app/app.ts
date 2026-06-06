import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Intimation as IntimationService } from './core/services/intimation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Maintenance_2.0');

  constructor(private intimationService: IntimationService) {}

  ngOnInit() {
    this.updateBackgroundGradient();

    // Listen for theme changes to recalculate gradient colors
    window.addEventListener('themeChanged', () => {
      this.updateBackgroundGradient();
    });
  }

  updateBackgroundGradient() {
    this.intimationService.getToolStatus().subscribe({
      next: (res) => {
        if (res && res.tooldata && Array.isArray(res.tooldata)) {
          let criticalCount = 0;
          let warningCount = 0;
          let okCount = 0;

          res.tooldata.forEach((tool: any) => {
            const status = tool.status?.toLowerCase();
            if (status === 'critical') criticalCount++;
            else if (status === 'warning') warningCount++;
            else if (status === 'ok') okCount++;
          });

          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          
          let dominantColor = isDark ? '#450a0a' : '#fdeaea'; // Default red hint

          if (criticalCount > warningCount && criticalCount > okCount) {
            dominantColor = isDark ? '#450a0a' : '#fdeaea'; // Red
          } else if (warningCount > criticalCount && warningCount > okCount) {
            dominantColor = isDark ? '#451a03' : '#fef3c7'; // Amber
          } else if (okCount > criticalCount && okCount > warningCount) {
            dominantColor = isDark ? '#052e16' : '#dcfce7'; // Green
          }

          document.documentElement.style.setProperty('--bg-dynamic-accent', dominantColor);
        }
      },
      error: () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.style.setProperty('--bg-dynamic-accent', isDark ? '#450a0a' : '#fdeaea');
      }
    });
  }
}

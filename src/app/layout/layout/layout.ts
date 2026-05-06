import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IntimationSlip } from '../../components/intimation-slip/intimation-slip';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ButtonModule, DialogModule, IntimationSlip],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
  visibleSlip: boolean = false;

  showSlip() {
    this.visibleSlip = true;
  }
}
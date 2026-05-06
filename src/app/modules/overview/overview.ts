import { Component } from '@angular/core';
import { ToolboxListComponent } from "./Addons/toolbox-list/toolbox-list";

@Component({
  selector: 'app-overview',
  imports: [ToolboxListComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {}

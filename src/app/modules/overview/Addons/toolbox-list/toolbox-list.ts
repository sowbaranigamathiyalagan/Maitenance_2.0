  import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ ADD THIS
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toolbox-list',
  standalone: true,
  imports: [CommonModule,FormsModule], // ✅ ADD THIS
  templateUrl: './toolbox-list.html',
  styleUrls: ['./toolbox-list.scss']
})
export class ToolboxListComponent implements OnInit {
   toolboxes = [
    { id: 12, name: 'RBM - 12', status: 'critical', type: 'IMM' },
    { id: 13, name: 'RBM - 13', status: 'ok', type: 'Store Room' },
    { id: 14, name: 'RBM - 14', status: 'critical', type: 'Tool Room' },
    { id: 15, name: 'RBM - 15', status: 'ok', type: 'Store Room' },
    { id: 16, name: 'RBM - 16', status: 'critical', type: 'Tool Room' },
    { id: 17, name: 'RBM - 17', status: 'warning', type: 'IMM' },
    { id: 18, name: 'RBM - 18', status: 'warning', type: 'IMM' },
    { id: 19, name: 'RBM - 19', status: 'ok', type: 'Tool Room' },
    { id: 20, name: 'RBM - 20', status: 'warning', type: 'IMM' },
    { id: 21, name: 'RBM - 21', status: 'critical', type: 'Tool Room' }
  ];
   ngOnInit() {
    
  }
  // ADD STATUS LOGIC HERE
  getStatusClass(status: string) {
    return {
      critical: status === 'critical',
      warning: status === 'warning',
      ok: status === 'ok'
    };
  }

  currentPage = 1;
pageSize = 15;

get paginatedData() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.toolboxes.slice(start, start + this.pageSize);
}

get pages() {
  return Array(Math.ceil(this.toolboxes.length / this.pageSize))
    .fill(0)
    .map((_, i) => i + 1);
}

goToPage(page: number) {
  this.currentPage = page;
}

nextPage() {
  if (this.currentPage < this.pages.length) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
}
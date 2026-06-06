import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { Intimation as IntimationService } from '../../core/services/intimation';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TableModule,
    TooltipModule,
    ToggleSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  activeTab: 'users' | 'checklist' | 'spares' = 'users';

  // ── Session info ────────────────────────────────────────────
  userType: string = '';
  userName: string = '';
  plantname: string = '';

  // =======================================================================
  // USER MANAGEMENT STATE
  // =======================================================================
  usersView: 'list' | 'create' = 'list';
  users: any[] = [];
  usersLoading: boolean = false;
  createForm: any = this.emptyForm();
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  fetchingCode: boolean = false;
  creating: boolean = false;

  userTypeOptions = [
    { label: 'Admin',       value: 'BASE-ADMIN'  },
    { label: 'Tool Room',   value: 'TOOL-ROOM'   },
    { label: 'IMG',         value: 'IMG'         },
    { label: 'QA',          value: 'QA'          },
    { label: 'Maintenance', value: 'MAINTENANCE' },
  ];

  // =======================================================================
  // CHECKLIST MANAGEMENT STATE
  // =======================================================================
  checkItems: any[] = [];
  checklistLoading: boolean = false;
  newCheckItem: string = '';
  addingCheckItem: boolean = false;

  // =======================================================================
  // SPARE MANAGEMENT STATE
  // =======================================================================
  sparesList: any[] = [];
  sparesLoading: boolean = false;
  newSparePart = { partName: '', itemcode: '' };
  addingSparePart: boolean = false;
  csvUploading: boolean = false;

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.userType  = this.cookieService.get('Usertype')  || '';
    this.userName  = this.cookieService.get('Username')  || 'User';
    this.plantname = this.cookieService.get('Plantname') || sessionStorage.getItem('udPlantname') || '';

    this.fetchUsers();
  }

  get isAdmin() { return this.userType === 'BASE-ADMIN' || this.userType === 'ADMIN'; }

  switchTab(tab: 'users' | 'checklist' | 'spares') {
    this.activeTab = tab;
    if (tab === 'users') {
      this.fetchUsers();
    } else if (tab === 'checklist') {
      this.fetchChecklist();
    } else if (tab === 'spares') {
      this.fetchSpares();
    }
  }

  // =======================================================================
  // USER MANAGEMENT LOGIC
  // =======================================================================
  fetchUsers() {
    this.usersLoading = true;
    this.cdr.detectChanges();
    this.intimationService.getUsers(this.plantname).subscribe({
      next: (res) => {
        this.zone.run(() => {
          let fetchedUsers = Array.isArray(res) ? res : (res.users || res.data || []);
          if (!this.isAdmin) {
            fetchedUsers = fetchedUsers.filter((u: any) => (u.udusername || u.username) === this.userName);
          }
          this.users = fetchedUsers;
          this.usersLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('[UserMgmt] Failed to load users:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users.' });
          this.usersLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  goToCreateUser() {
    this.resetCreateForm();
    this.usersView = 'create';
  }

  goToListUsers() {
    this.usersView = 'list';
    this.fetchUsers();
  }

  submitCreateUser() {
    if (!this.validateForm()) return;

    this.fetchingCode = true;
    this.intimationService.getUserCode(this.plantname).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.fetchingCode = false;
          const userCode = res.ucode || res.usercode || res.user_code || '';
          this.doCreateUser(userCode);
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.fetchingCode = false;
          console.error('[UserMgmt] Failed to fetch user code:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user code.' });
          this.cdr.detectChanges();
        });
      },
    });
  }

  private doCreateUser(userCode: string) {
    const f = this.createForm;
    const payload = {
      udPlantname:       this.plantname,
      udaddress1:        null,
      udconfirmpassword: f.confirmPassword,
      udemail:           f.email,
      udfirstName:       f.firstName,
      udlanguage:        null,
      udlastName:        f.lastName,
      udlocation:        f.location,
      udpassword:        f.password,
      udstatus:          null,
      udtype:            f.userType?.value ?? f.userType,
      udusercode:        userCode,
      udusername:        f.username,
    };

    this.creating = true;
    this.intimationService.createUser(this.plantname, payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.creating = false;
          this.messageService.add({ severity: 'success', summary: 'User Created', detail: `${f.firstName} ${f.lastName} added successfully.` });
          this.goToListUsers();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.creating = false;
          console.error('[UserMgmt] Failed to create user:', err);
          this.messageService.add({ severity: 'error', summary: 'Creation Failed', detail: err?.error?.message || 'Could not create user.' });
          this.cdr.detectChanges();
        });
      },
    });
  }

  validateForm(): boolean {
    const f = this.createForm;
    const missing: string[] = [];
    if (!f.firstName.trim())       missing.push('First Name');
    if (!f.lastName.trim())        missing.push('Last Name');
    if (!f.username.trim())        missing.push('Username');
    if (!f.email.trim())           missing.push('Email');
    if (!f.password.trim())        missing.push('Password');
    if (!f.confirmPassword.trim()) missing.push('Confirm Password');
    if (!f.location.trim())        missing.push('Location');
    if (!f.userType)               missing.push('User Group');

    if (missing.length) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: missing.join(', ') });
      return false;
    }
    if (f.password !== f.confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Mismatch', detail: 'Passwords do not match.' });
      return false;
    }
    return true;
  }

  emptyForm() {
    return { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', location: '', userType: null };
  }

  resetCreateForm() {
    this.createForm         = this.emptyForm();
    this.showPassword       = false;
    this.showConfirmPassword= false;
  }

  getUserTypeLabel(type: string): string {
    return this.userTypeOptions.find(o => o.value === type)?.label ?? type;
  }

  // =======================================================================
  // CHECKLIST MANAGEMENT LOGIC
  // =======================================================================
  fetchChecklist() {
    this.checklistLoading = true;
    this.cdr.detectChanges();
    this.intimationService.getChecklistSettings().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.checkItems = res.check_items || [];
          this.checklistLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('[Checklist] Load error', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load checklist items.' });
          this.checklistLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  addCheckItem() {
    if (!this.newCheckItem.trim()) return;
    this.addingCheckItem = true;
    const payload = {
      action: 'add',
      check_item: this.newCheckItem.trim()
    };

    this.intimationService.updateChecklistSettings(payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Checklist item added successfully.' });
          this.newCheckItem = '';
          this.addingCheckItem = false;
          this.fetchChecklist();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.addingCheckItem = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add checklist item.' });
          this.cdr.detectChanges();
        });
      }
    });
  }

  toggleCheckItem(item: any, event: any) {
    const payload = {
      action: 'edit',
      id: item.id.toString(),
      active: event.checked
    };

    this.intimationService.updateChecklistSettings(payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Item status updated.' });
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          // Revert toggle on error
          item.active = !item.active;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.' });
          this.cdr.detectChanges();
        });
      }
    });
  }

  deleteCheckItem(item: any) {
    const payload = {
      action: 'delete',
      id: item.id.toString()
    };

    this.intimationService.updateChecklistSettings(payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Checklist item deleted successfully.' });
          this.fetchChecklist();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item.' });
          this.cdr.detectChanges();
        });
      }
    });
  }

  // =======================================================================
  // SPARE MANAGEMENT LOGIC
  // =======================================================================
  fetchSpares() {
    this.sparesLoading = true;
    this.cdr.detectChanges();
    this.intimationService.getSpares().subscribe({
      next: (res) => {
        this.zone.run(() => {
          // Assuming response is an array or { data: [...] } or { spares: [...] }
          this.sparesList = Array.isArray(res) ? res : (res.data || res.spares || []);
          this.sparesLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load spare parts.' });
          this.sparesLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  addSparePart() {
    if (!this.newSparePart.partName.trim() || !this.newSparePart.itemcode.trim()) return;
    
    this.addingSparePart = true;
    this.intimationService.addSpare(this.newSparePart).subscribe({
      next: () => {
        this.zone.run(() => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Spare part added successfully.' });
          this.newSparePart = { partName: '', itemcode: '' };
          this.addingSparePart = false;
          this.fetchSpares();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.addingSparePart = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add spare part.' });
          this.cdr.detectChanges();
        });
      }
    });
  }

  downloadCsvTemplate() {
    const csvContent = "itemcode,partName\nSample Part Name,Sample Item Code";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'spare_parts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onCsvSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Please upload a valid .csv file.' });
      return;
    }

    this.csvUploading = true;
    this.messageService.add({ severity: 'info', summary: 'Uploading...', detail: 'Uploading CSV file...' });

    this.intimationService.uploadSparesCSV(file).subscribe({
      next: () => {
        this.zone.run(() => {
          this.csvUploading = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'CSV uploaded and parts added successfully.' });
          this.fetchSpares();
          // reset input
          event.target.value = '';
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.csvUploading = false;
          this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to process CSV upload.' });
          this.cdr.detectChanges();
          event.target.value = '';
        });
      }
    });
  }
}

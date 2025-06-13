import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClickAdminService } from 'src/app/services/click-admin.service';

@Component({
  selector: 'app-click-detail',
  templateUrl: './click-detail.component.html',
  styleUrls: ['./click-detail.component.css']
})
export class ClickDetailComponent implements OnInit {
  clickForm: FormGroup;
  clickId: string;
  loading = true;
  showHistory: boolean = false;
  historyLogs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private clickAdminService: ClickAdminService,
    private router: Router
  ) {
    this.clickForm = this.fb.group({
      userId: [''],
      storeId: [''],
      affiliateLink: [''],
      date: [''],
      click_hash: [''],
      cashback_percentage: [0],
    });
    this.clickId = this.route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit() {
    const click = await this.clickAdminService.getClickById(this.clickId);
    this.clickForm.patchValue(click);
    this.loading = false;
  }

  async save() {
    const formData = this.clickForm.value;
    await this.clickAdminService.updateClick(this.clickId, formData);
    alert('Click updated!');
  }

  async delete() {
    if (confirm('Are you sure you want to delete this click?')) {
      await this.clickAdminService.deleteClick(this.clickId);
      alert('Click deleted!');
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.fetchHistoryLogs();
    }
  }

  fetchHistoryLogs(): void {
    this.clickAdminService.getClickHistory(this.clickId).then(
      (logs: any[]) => {
        this.historyLogs = logs;
      },
      (error: any) => {
        console.error('Error fetching history logs:', error);
      }
    );
  }
}

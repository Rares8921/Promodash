import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PromoCodeService } from 'src/app/services/promo-code.service';

@Component({
  selector: 'app-promo-code-detail',
  templateUrl: './promo-code-detail.component.html',
  styleUrls: ['./promo-code-detail.component.css']
})
export class PromoCodeDetailComponent implements OnInit {
  promoForm: FormGroup;
  promoId: string;
  loading = true;
  showHistory = false;
  historyLogs: any[] = [];

  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private promoCodeService: PromoCodeService,
    private router: Router
  ) {
    this.promoForm = this.fb.group({
      code: [''],
      percentageBoost: [0],
      expirationDate: [''],
      maxUses: [0],
      uses: [0]
    });

    this.promoId = this.route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.promoCodeService.getPromoCodeById(this.promoId);
      this.promoForm.patchValue(data);
    } catch (err) {
      console.error('Failed to load promo code:', err);
    } finally {
      this.loading = false;
    }
  }

  formatTimestamp(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  async save(): Promise<void> {
    const updatedData = this.promoForm.value;
    await this.promoCodeService.updatePromoCode(this.promoId, updatedData);
    alert('Promo code updated!');
  }

  async delete(): Promise<void> {
    if (confirm('Are you sure you want to delete this promo code?')) {
      await this.promoCodeService.deletePromoCode(this.promoId);
      alert('Promo code deleted!');
      this.router.navigate(['/dashboard']);
    }
  }

  resetForm(): void {
    this.ngOnInit();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.fetchHistoryLogs();
    }
  }

  async fetchHistoryLogs(): Promise<void> {
    try {
      this.historyLogs = await this.promoCodeService.getPromoCodeHistory(this.promoId);
    } catch (err) {
      console.error('Failed to load history logs:', err);
    }
  }

  async deleteHistoryEntry(timestamp: string): Promise<void> {
    if (confirm('Delete this log entry?')) {
      await this.promoCodeService.deletePromoCodeHistoryEntry(timestamp);
      this.fetchHistoryLogs();
    }
  }
}

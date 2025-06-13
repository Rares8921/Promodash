import { Component, OnInit } from '@angular/core';
import { PromoCodeService } from '../../services/promo-code.service';

@Component({
  selector: 'app-promo-codes',
  templateUrl: './promo-codes.component.html',
  styleUrls: ['./promo-codes.component.css']
})
export class PromoCodesComponent implements OnInit {
  promoCodes: any[] = [];
  loading = false;

  constructor(private promoCodeService: PromoCodeService) {}

  async ngOnInit(): Promise<void> {
    await this.loadPromoCodes();
  }

  async loadPromoCodes(): Promise<void> {
    try {
      this.loading = true;
      this.promoCodes = await this.promoCodeService.getAllPromoCodes();
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    } finally {
      this.loading = false;
    }
  }

  async deletePromoCode(id: string): Promise<void> {
    try {
      await this.promoCodeService.deletePromoCode(id);
      await this.loadPromoCodes();
    } catch (error) {
      console.error('Failed to delete promo code:', error);
    }
  }
}

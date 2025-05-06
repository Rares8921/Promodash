import { Component, OnInit } from '@angular/core';
import { ProfitshareService } from 'src/app/services/profitshare.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.css']
})
export class ShopsComponent implements OnInit {
  shops: any[] = [];
  loading = true;

  constructor(private profitshareService: ProfitshareService) {}

  async ngOnInit() {
    try {
      const data = await this.profitshareService.getAdvertisers();
      this.shops = data.result || [];
    } catch (error) {
      console.error('Error loading shops', error);
    } finally {
      this.loading = false;
    }
  }
}

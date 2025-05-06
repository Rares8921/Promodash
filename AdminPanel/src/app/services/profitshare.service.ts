import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as crypto from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class ProfitshareService {
  private apiUser = environment.profitshareUser;
  private apiKey = environment.profitshareKey;
  private baseUrl = 'https://api.profitshare.ro';

  constructor() {}

  async getAdvertisers() {
    const date = new Date().toUTCString();
    const queryString = '';

    const signatureString =
      'GET' +
      'affiliate-advertisers/?' +
      queryString +
      '/' +
      this.apiUser +
      date;

    const signature = crypto
      .HmacSHA1(signatureString, this.apiKey)
      .toString(crypto.enc.Hex);

    const url = `${this.baseUrl}/affiliate-advertisers/?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Date: date,
          'X-PS-Client': this.apiUser,
          'X-PS-Accept': 'json',
          'X-PS-Auth': signature,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Profitshare error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Profitshare advertisers:', error);
      throw error;
    }
  }
}

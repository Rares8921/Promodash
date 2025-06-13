import { Injectable } from '@angular/core';
import { Client, Databases, ID } from 'appwrite';
import { environment } from 'src/environments/environment';
import { openDB, DBSchema } from 'idb';

interface PromoHistoryEntry {
  promoId: string;
  action: string;
  timestamp: string;
  details?: any;
}

interface PromoHistoryDB extends DBSchema {
  promoHistory: {
    key: string;
    value: PromoHistoryEntry;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);
  private dataBaseId = environment.dataBaseId;
  private collectionId = environment.promocodesCollectionId;

  private async getHistoryDB() {
    return await openDB<PromoHistoryDB>('promo-history-db', 1, {
      upgrade(db) {
        db.createObjectStore('promoHistory', { keyPath: 'timestamp' });
      }
    });
  }

  async getAllPromoCodes(): Promise<any[]> {
    const res = await this.databases.listDocuments(this.dataBaseId, this.collectionId);
    return res.documents.map(doc => ({
      $id: doc.$id,
      code: doc.code || '',
      percentageBoost: doc.percentageBoost || 0,
      expirationDate: doc.expirationDate,
      maxUses: doc.maxUses || 0,
      uses: doc.uses || 0,
      expired: new Date(doc.expirationDate) < new Date()
    }));
  }

  async getPromoCodeById(id: string): Promise<any> {
    return await this.databases.getDocument(this.dataBaseId, this.collectionId, id);
  }

  async createPromoCode(data: any): Promise<any> {
    const result = await this.databases.createDocument(this.dataBaseId, this.collectionId, ID.unique(), data);
    await this.logPromoChange(result.$id, 'create', { ...data });
    return result;
  }

  async updatePromoCode(id: string, data: any): Promise<any> {
    const prev = await this.getPromoCodeById(id);
    const result = await this.databases.updateDocument(this.dataBaseId, this.collectionId, id, data);

    const changes: Record<string, { from: any; to: any }> = {};
    for (const key in data) {
      const oldVal = prev[key];
      const newVal = data[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { from: oldVal, to: newVal };
      }
    }

    await this.logPromoChange(id, 'update', { changes });
    return result;
  }

  async deletePromoCode(id: string): Promise<void> {
    const doc = await this.getPromoCodeById(id);
    await this.databases.deleteDocument(this.dataBaseId, this.collectionId, id);
    await this.logPromoChange(id, 'delete', { code: doc.code });
  }

  async deleteExpiredPromoCodes(): Promise<void> {
    const all = await this.getAllPromoCodes();
    const expired = all.filter(code => code.expired);
    for (const code of expired) {
      await this.deletePromoCode(code.$id);
    }
  }

  async logPromoChange(promoId: string, action: string, details: any): Promise<void> {
    try {
      const db = await this.getHistoryDB();
      const logs = await db.getAll('promoHistory');
      const filtered = logs.filter(log => log.promoId === promoId);

      if (filtered.length >= 10) {
        const oldest = filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
        await db.delete('promoHistory', oldest.timestamp);
      }

      const entry: PromoHistoryEntry = {
        promoId,
        action,
        timestamp: new Date().toISOString(),
        details
      };

      await db.add('promoHistory', entry);
    } catch (err) {
      console.error('[HISTORY] Failed to save promo history:', err);
    }
  }

  async getPromoCodeHistory(promoId: string): Promise<PromoHistoryEntry[]> {
    try {
      const db = await this.getHistoryDB();
      const all = await db.getAll('promoHistory');
      return all.filter(entry => entry.promoId === promoId);
    } catch (err) {
      console.error('[HISTORY] Failed to read promo history:', err);
      return [];
    }
  }

  async deletePromoCodeHistoryEntry(timestamp: string): Promise<void> {
    try {
      const db = await this.getHistoryDB();
      await db.delete('promoHistory', timestamp);
    } catch (err) {
      console.error('[HISTORY] Failed to delete promo history entry:', err);
    }
  }
}

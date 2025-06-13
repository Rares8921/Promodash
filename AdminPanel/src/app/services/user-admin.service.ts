import { Injectable } from '@angular/core';
import { Databases, Account, Client, ID, Query } from 'appwrite';
import * as crypto from 'crypto-js';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { openDB, DBSchema } from 'idb';

interface HistoryEntry {
  user: string;
  action: string;
  timestamp: string;
  email: string;
  changes?: Record<string, { from: any; to: any }>;
}

interface HistoryDB extends DBSchema {
  history: {
    key: string;
    value: HistoryEntry;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);
  private account = new Account(this.client);

  constructor(private http: HttpClient) {}

  private async getHistoryDB() {
    return await openDB<HistoryDB>('history-db', 1, {
      upgrade(db) {
        db.createObjectStore('history', { keyPath: 'timestamp' });
      }
    });
  }

  async getUserById(userId: string) {
    const response = await this.databases.getDocument(environment.dataBaseId, environment.userCollectionId, userId);
    return response;
  }

  encryptPassword(password: string): string {
    return crypto.SHA256(password).toString();
  }

  async updateUser(userId: string, data: any, oldEmail: string, emailChanged: boolean) {
    const previous = await this.getUserById(userId);
    await this.databases.updateDocument(environment.dataBaseId, environment.userCollectionId, userId, data);

    if (emailChanged) {
      const requests = await this.databases.listDocuments(environment.dataBaseId, environment.requestCollectionId, [
        Query.equal('email', oldEmail)
      ]);

      for (const req of requests.documents) {
        await this.databases.updateDocument(environment.dataBaseId, environment.requestCollectionId, req.$id, {
          email: data.email
        });
      }

      console.warn('WARNING: You need backend code to patch auth email via admin privileges');
    }

    const changes: Record<string, { from: any; to: any }> = {};

    for (const key in data) {
      if (key === 'password') {
        continue;
      }
      const oldVal = previous[key];
      const newVal = data[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { from: oldVal, to: newVal };
      }
    }

    await this.logUserChange(userId, 'update', {
      email: data.email || oldEmail,
      changes
    });
  }


  async deleteUser(userId: string, userEmail: string) {
    await this.databases.deleteDocument(environment.dataBaseId, environment.userCollectionId, userId);

    const requests = await this.databases.listDocuments(environment.dataBaseId, environment.requestCollectionId, [
      Query.equal('email', userEmail)
    ]);
    for (const req of requests.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.requestCollectionId, req.$id);
    }

    const clicks = await this.databases.listDocuments(environment.dataBaseId, environment.clickCollectionId, [
      Query.equal('userId', userId)
    ]);
    for (const click of clicks.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.clickCollectionId, click.$id);
    }

    const withdrawals = await this.databases.listDocuments(environment.dataBaseId, environment.withdrawCollectionId, [
      Query.equal('userId', userId)
    ]);
    for (const wd of withdrawals.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.withdrawCollectionId, wd.$id);
    }

    console.warn('WARNING: You need backend code to delete auth user + sessions via admin privileges');

    await this.logUserChange(userId, 'delete', { email: userEmail });
  }

  async logUserChange(user: string, action: string, details: any) {
    try {
      const db = await this.getHistoryDB();
      const log: HistoryEntry = {
        user,
        action,
        email: details.email || '',
        timestamp: new Date().toISOString(),
        changes: details.changes || undefined
      };
      await db.add('history', log);
      console.log('[HISTORY] Log saved:', log);
    } catch (err) {
      console.error('[HISTORY] Failed to save log:', err);
    }
  }

  async getUserHistory(email: string): Promise<any[]> {
    try {
      const db = await this.getHistoryDB();
      const all = await db.getAll('history');
      console.log('[HISTORY] All logs:', all);
      const filtered = all.filter(entry => entry.email === email);
      console.log(`[HISTORY] Filtered logs for ${email}:`, filtered);
      return filtered;
    } catch (err) {
      console.error('[HISTORY] Failed to read history:', err);
      return [];
    }
  }

  async deleteUserHistoryEntry(timestamp: string): Promise<void> {
    try {
      const db = await this.getHistoryDB();
      await db.delete('history', timestamp);
      console.log(`[HISTORY] Deleted entry with timestamp ${timestamp}`);
    } catch (err) {
      console.error('[HISTORY] Failed to delete history entry:', err);
    }
  }


}

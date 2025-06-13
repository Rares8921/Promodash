import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Databases, Client, ID } from 'appwrite';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalAdminService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);
  private apiUrl = 'https://api.example.com';

  constructor(private http: HttpClient) {}

  async getWithdrawalById(withdrawalId: string) {
    const response = await this.databases.getDocument(
      environment.dataBaseId,
      environment.withdrawCollectionId,
      withdrawalId
    );
    return response;
  }

  async updateWithdrawal(withdrawalId: string, data: any) {
    await this.databases.updateDocument(
      environment.dataBaseId,
      environment.withdrawCollectionId,
      withdrawalId,
      data
    );
  }

  async deleteWithdrawal(withdrawalId: string) {
    await this.databases.deleteDocument(
      environment.dataBaseId,
      environment.withdrawCollectionId,
      withdrawalId
    );
  }

  async logWithdrawalChange(user: string, action: string, details: any) {
    const log = {
      user,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    await this.databases.createDocument(
      environment.dataBaseId,
      environment.historyCollectionId,
      ID.unique(),
      log
    );
  }

  getWithdrawalHistory(withdrawalId: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/withdrawals/${withdrawalId}/history`));
  }
}

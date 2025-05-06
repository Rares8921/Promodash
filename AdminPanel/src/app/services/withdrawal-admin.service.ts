import { Injectable } from '@angular/core';
import { Databases, Client } from 'appwrite';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalAdminService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);

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
}

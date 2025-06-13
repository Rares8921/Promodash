import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Databases, Client, ID } from 'appwrite';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClickAdminService {
  private client = new Client()
    .setEndpoint(environment.endpoint)
    .setProject(environment.projectId);

  private databases = new Databases(this.client);
  private databaseId = environment.dataBaseId;
  private clickCollectionId = environment.clickCollectionId;
  private apiUrl = 'https://api.example.com';

  constructor(private http: HttpClient) {}

  async getClickById(clickId: string) {
    const doc = await this.databases.getDocument(this.databaseId, this.clickCollectionId, clickId);
    return doc;
  }

  async updateClick(clickId: string, data: any) {
    await this.databases.updateDocument(this.databaseId, this.clickCollectionId, clickId, data);
  }

  async deleteClick(clickId: string) {
    await this.databases.deleteDocument(this.databaseId, this.clickCollectionId, clickId);
  }

  async logClickChange(user: string, action: string, details: any) {
    const log = {
      user,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    await this.databases.createDocument(
      this.databaseId,
      environment.historyCollectionId,
      ID.unique(),
      log
    );
  }

  getClickHistory(clickId: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/clicks/${clickId}/history`));
  }
}

import { Injectable } from '@angular/core';
import { Databases, Client } from 'appwrite';
import { environment } from 'src/environments/environment';

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
}

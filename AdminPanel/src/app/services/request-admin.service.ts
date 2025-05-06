import { Injectable } from '@angular/core';
import { Databases, Client } from 'appwrite';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestAdminService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);
  private dataBaseId = environment.dataBaseId;
  private requestCollectionId = environment.requestCollectionId;

  async getRequestById(id: string) {
    const doc = await this.databases.getDocument(this.dataBaseId, this.requestCollectionId, id);
    return {
      email: doc.email || '',
      subject: doc.subject || '',
      description: doc.description || '',
      status: doc.status || '',
      dateCreated: doc.$createdAt || '',
      image: doc.image || ''
    };
  }

  async updateRequest(id: string, data: any) {
    await this.databases.updateDocument(this.dataBaseId, this.requestCollectionId, id, data);
  }

  async deleteRequest(id: string) {
    await this.databases.deleteDocument(this.dataBaseId, this.requestCollectionId, id);
  }
  
}

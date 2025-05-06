import { Injectable } from '@angular/core';
import { Databases, Account, Client, ID, Query } from 'appwrite';
import * as crypto from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private client = new Client().setEndpoint(environment.endpoint).setProject(environment.projectId);
  private databases = new Databases(this.client);
  private account = new Account(this.client);

  async getUserById(userId: string) {
    const response = await this.databases.getDocument(environment.dataBaseId, environment.userCollectionId, userId);
    return response;
  }

  encryptPassword(password: string): string {
    return crypto.SHA256(password).toString();
  }

  async updateUser(userId: string, data: any, oldEmail: string, emailChanged: boolean) {
    await this.databases.updateDocument(environment.dataBaseId, environment.userCollectionId, userId, data);

    if (emailChanged) {
      // Update all requests with old email
      const requests = await this.databases.listDocuments(environment.dataBaseId, environment.requestCollectionId, [
        Query.equal('email', oldEmail)
      ]);

      for (const req of requests.documents) {
        await this.databases.updateDocument(environment.dataBaseId, environment.requestCollectionId, req.$id, {
          email: data.email
        });
      }

      // Update Appwrite auth user (needs admin key / server-side — placeholder here)
      // Normally: call a cloud function or backend endpoint to patch the auth user email
      console.warn('⚠ NOTE: You need backend code to patch auth email via admin privileges');
    }
  }

  async deleteUser(userId: string, userEmail: string) {
    // Delete user document
    await this.databases.deleteDocument(environment.dataBaseId, environment.userCollectionId, userId);

    // Delete related requests by email
    const requests = await this.databases.listDocuments(environment.dataBaseId, environment.requestCollectionId, [
      Query.equal('email', userEmail)
    ]);
    for (const req of requests.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.requestCollectionId, req.$id);
    }

    // Delete related clicks by userId
    const clicks = await this.databases.listDocuments(environment.dataBaseId, environment.clickCollectionId, [
      Query.equal('userId', userId)
    ]);
    for (const click of clicks.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.clickCollectionId, click.$id);
    }

    // Delete related withdrawals by userId
    const withdrawals = await this.databases.listDocuments(environment.dataBaseId, environment.withdrawCollectionId, [
      Query.equal('userId', userId)
    ]);
    for (const wd of withdrawals.documents) {
      await this.databases.deleteDocument(environment.dataBaseId, environment.withdrawCollectionId, wd.$id);
    }

    // Delete Appwrite auth user session (⚠ needs backend/admin SDK — placeholder here)
    console.warn('⚠ NOTE: You need backend code to delete auth user + sessions via admin privileges');
  }
}

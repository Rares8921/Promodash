import { getDebugNode, Injectable } from '@angular/core';
import { Card } from '../interfaces/card.model';
import { Databases, Query, OAuthProvider, Account, Client, Storage } from 'appwrite';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import * as crypto from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class CardService {

  endpoint = environment.endpoint;
  projectId = environment.projectId;
  dataBaseId = environment.dataBaseId;
  requestCollectionId = environment.requestCollectionId;
  userCollectionId = environment.userCollectionId;
  clickCollectionId = environment.clickCollectionId;
  withdrawCollectionId = environment.withdrawCollectionId;
  userId = environment.userId;
  email = environment.email;
  password = environment.password;

  cards: Card[] = [];

  private client = new Client().setEndpoint(this.endpoint).setProject(this.projectId);

  private account = new Account(this.client); // plm this
  private databases = new Databases(this.client);

  timeSince = (date: string): string => {
    const now = new Date(); // Current time
    const pastDate = new Date(date); // conv la date obj
    const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000); 
  
    const minutes = Math.floor(seconds / 60); 
    const hours = Math.floor(minutes / 60); 
    const days = Math.floor(hours / 24); 
  
    if (seconds < 60) {
      return `${seconds} sec`;
    } else if (minutes < 60) {
      return `${minutes} min`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
    }
  };

  getClicks = async () => {
    await this.signIn();
    const documents = await this.fetchAllDocuments(this.clickCollectionId);
    return documents.map(doc => ({
      $id: doc.$id,
      userId: doc.userId || '',
      storeId: doc.storeId || '',
      affiliateLink: doc.affiliateLink || '',
      date: doc.$createdAt || '',
      click_hash: doc.click_hash || '',
      cashback_percentage: doc.cashback_percentage || 0,
    }));
  }

  getRequests = async () => {
    const documents = await this.fetchAllDocuments(this.requestCollectionId);
    const cards: Card[] = documents.map(doc => ({
      $id: doc.$id,
      email: doc.email || '',
      subject: doc.subject || '',
      description: doc.description || '',
      status: doc.status || '',
      dateCreated: doc.$createdAt || '',
      timestamp: this.timeSince(doc.$updatedAt),
      image: doc.image || '',
      content: doc.description || '',
    }));
    return cards;
  }
  
  // Appwrite are limita de 25/request asa ca e nevoie de urmatoarea functie
  async fetchAllDocuments(collectionId: string) {
    const batchSize = 100;
    let allDocs: any[] = [];
    let offset = 0;
  
    while (true) {
      const response = await this.databases.listDocuments(
        this.dataBaseId,
        collectionId,
        [Query.limit(batchSize), Query.offset(offset)]
      );
  
      allDocs = allDocs.concat(response.documents);
  
      if (response.documents.length < batchSize) {
        break; // Nu mai avem
      }
      offset += batchSize;
    }
  
    return allDocs;
  }

  getAllUsers = async () => {
    const documents = await this.fetchAllDocuments(this.userCollectionId);
    return documents.map(doc => ({
      $id: doc.$id,
      email: doc.email || '',
      Balance: doc.Balance || 0,
      Pending_Credits: doc.Pending_Credits || 0,
      Name: doc.Name || '',
      Invite_Code: doc.Invite_Code || '',
      Invited_By: doc.Invited_By || '',
      Pending_Invite_Bonus: doc.Pending_Invite_Bonus || 0,
      Invite_Count: doc.Invite_Count || 0,
      Earned_Bonus: doc.Earned_Bonus || 0,
      Verified: doc.Verified || false,
    }));
  }
  
  getWithdrawals = async () => {
    const documents = await this.fetchAllDocuments(this.withdrawCollectionId);
    return documents.map(doc => ({
      $id: doc.$id,
      userId: doc.userId || '',
      amount: doc.amount || 0,
      IBAN: doc.IBAN || '',
      status: doc.status || '',
      transactionId: doc.transactionId || '',
      createdAt: doc.$createdAt || '',
      updatedAt: doc.$updatedAt || '',
    }));
  }

  getUserData = async () => {
  try {
    if (!this.userId) {
      console.warn("No user logged in.");
      return null;
    }

    const response = await this.databases.getDocument(
      this.dataBaseId,
      this.userCollectionId,
      this.userId
    );

    if(!response) {
      return "Nu exista date!";
    }

    return {
      balance: response.Balance || 0,
      pendingCredits: response.Pending_Credits || 0,
      email: response.email || "No email",
      name: response.Name || "Anonymous",
      theme: response.Theme || "Light",
      notifications: response.Notifications !== undefined ? response.Notifications : true,
      Invite_Code: response.Invite_Code,
      Invited_By: response.Invited_By,
      language: response.Language || "en",
      pendingInviteBonus: response.Pending_Invite_Bonus || 0,
      inviteCount: response.Invite_Count || 0,
      earnedBonus: response.Earned_Bonus || 0,
      verified: response.Verified
    };
  } catch (error) {
    throw new Error("Database fetch fail. Check appwrite connection");
  }
  
};

async getUserById(userId: string) {
  const response = await this.databases.getDocument(
    this.dataBaseId,
    this.userCollectionId,
    userId
  );
  return response;
}

async toggleUserStatus(userId: string) {
  const user = await this.getUserById(userId);
  const newStatus = !user.active;  // presupunem ca ai un câmp 'active'
  return await this.databases.updateDocument(
    this.dataBaseId,
    this.userCollectionId,
    userId,
    { active: newStatus }
  );
}

async resetUserPassword(userId: string) {
  // Ai nevoie de implementare pe backend sau să trimiți manual email
  // placeholder pentru acum
  console.log('Trigger password reset for', userId);
}

async deleteUser(userId: string) {
  return await this.databases.deleteDocument(
    this.dataBaseId,
    this.userCollectionId,
    userId
  );
}

signIn = async () => {
  try {
    const currentSession = await this.account.get();
    return currentSession;
  } catch (error: any) {
    if (error?.code === 401) {
      const session = await this.account.createEmailPasswordSession(this.email, this.password);
      console.log("User signed in (new session)");
      return session;
    } else {
      console.error("Error checking session:", error);
      throw error;
    }
  }
}


  async getClickStats() {
    await this.signIn();
    const response = await this.databases.listDocuments(this.dataBaseId, this.clickCollectionId);
    return response.documents.map(doc => ({
      date: doc.$createdAt,
    }));
  }

  async getWithdrawalStats() {
    await this.signIn();
    const response = await this.databases.listDocuments(this.dataBaseId, this.withdrawCollectionId);
    return response.documents.map(doc => ({
      date: doc.$createdAt,
      amount: doc.amount || 0,
    }));
  }

  async getCommissionStats() {
    const apiUser = environment.profitshareUser;
    const apiKey = environment.profitshareKey;
    const apiUrl = 'https://api.profitshare.ro/affiliate-commissions/';

    const date = new Date().toUTCString();
    const signatureString = `GETaffiliate-commissions/?/${apiUser}${date}`;
    const auth = crypto.HmacSHA1(signatureString, apiKey).toString();

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Date: date,
          'X-PS-Client': apiUser,
          'X-PS-Accept': 'json',
          'X-PS-Auth': auth,
        },
      });

      const commissions = response.data.result.commissions;
      return commissions.map((item: any) => ({
        date: item.order_date,
        amount: item.items_commision.split('|').reduce((sum: number, val: string) => sum + parseFloat(val), 0),
      }));
    } catch (error) {
      console.error('Error fetching Profitshare commissions', error);
      return [];
    }
  }

// Exemplu de update, poate ai nevoie
// export const updateUserData = async (field, value) => {

//   try {
//     const userId = await getUserId();
//     if (!userId) {
//       console.warn("No user logged in.");
//       return false;
//     }

//     const updatePayload = { [field]: value };

//     await databases.updateDocument(
//       appwriteConfig.dataBaseId,
//       appwriteConfig.userCollectionId,
//       userId,
//       updatePayload
//     );

//     return true;
//   } catch (error) {
//     throw new Error(i18n.t("appwrite.user_update_fail"));
//   }
// };
  
}

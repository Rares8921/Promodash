import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminEmailService {
  private webhookUrl = 'https://promodash.vercel.app/api/mail_message_webhook';

  constructor(private http: HttpClient) {}

  sendAdminEmail(email: string, subject: string, body: string) {
    const payload = {
      type: 'adminNotify',
      email,
      subject,
      body
    };

    return this.http.post<{ message: string }>(this.webhookUrl, payload).toPromise();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestAdminService } from 'src/app/services/request-admin.service';
import { AdminEmailService } from 'src/app/services/admin-email.service';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css']
})
export class RequestDetailComponent implements OnInit {
  requestForm: FormGroup;
  requestId: string;
  loading = true;

  emailForm: FormGroup;
  requestData: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private requestAdminService: RequestAdminService,
    private adminEmailService: AdminEmailService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      email: [''],
      subject: [''],
      description: [''],
      status: [''],
    });
    this.requestId = this.route.snapshot.paramMap.get('id')!;
    this.emailForm = this.fb.group({
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  async ngOnInit() {
    const request = await this.requestAdminService.getRequestById(this.requestId);
    this.requestForm.patchValue(request);
    this.loading = false;
    this.requestData = request;
  }

  getFullBase64(imageString: string) {
    if (!imageString) return null;
  
    if (imageString.startsWith('data:image')) {
      return imageString;
    }
  
    return `data:image/png;base64,${imageString}`;
  }
  

  async save() {
    await this.requestAdminService.updateRequest(this.requestId, this.requestForm.value);
    alert('Request updated!');
  }

  async delete() {
    if (confirm('Are you sure you want to delete this request?')) {
      await this.requestAdminService.deleteRequest(this.requestId);
      alert('Request deleted!');
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async sendEmailToUser() {
    const email = this.requestForm.value.email;
    const subject = this.emailForm.value.subject;
    const body = this.emailForm.value.body;
  
    try {
      const response = await this.adminEmailService.sendAdminEmail(email, subject, body);
      console.log('Email sent successfully:', response);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email.');
    }
  }
  
}

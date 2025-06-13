import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserAdminService } from 'src/app/services/user-admin.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string;
  originalEmail: string = '';
  loading = true;
  showHistory: boolean = false;
  historyLogs: any[] = [];

  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userAdminService: UserAdminService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: [''],
      Balance: [0],
      Pending_Credits: [0],
      Name: [''],
      Invite_Code: [''],
      Invited_By: [''],
      Pending_Invite_Bonus: [0],
      Invite_Count: [0],
      Earned_Bonus: [0],
      Verified: [false],
      password: ['']
    });
    this.userId = this.route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit() {
    const user = await this.userAdminService.getUserById(this.userId);
    this.userForm.patchValue(user);
    this.originalEmail = user.email; // store original email
    this.loading = false;
  }

  formatTimestamp(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  async save() {
    const formData = this.userForm.value;

    if (formData.password) {
      formData.password = this.userAdminService.encryptPassword(formData.password);
    } else {
      delete formData.password;
    }

    // Check if email changed
    const emailChanged = formData.email !== this.originalEmail;

    await this.userAdminService.updateUser(this.userId, formData, this.originalEmail, emailChanged);

    if (this.showHistory) {
      this.fetchHistoryLogs(); // refresh live
    }

    alert('User updated!');
  }

  async delete() {
    if (confirm('Are you sure you want to delete this user?')) {
      await this.userAdminService.deleteUser(this.userId, this.originalEmail);

      // Log the delete action
      await this.userAdminService.logUserChange(this.userId, 'delete', { email: this.originalEmail });

      alert('User deleted!');

      this.router.navigate(['/dashboard']);
    }
  }

  resetForm() {
    this.userForm.reset();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.fetchHistoryLogs();
    }
  }

  fetchHistoryLogs(): void {
    this.userAdminService.getUserHistory(this.originalEmail).then(
      (logs: any[]) => {
        this.historyLogs = logs;
      },
      (error: any) => {
        console.error('Error fetching history logs:', error);
      }
    );
  }

  async deleteHistoryEntry(timestamp: string) {
    if (confirm('Delete this log entry?')) {
      await this.userAdminService.deleteUserHistoryEntry(timestamp);
      this.fetchHistoryLogs(); // reload the view
    }
  }
}

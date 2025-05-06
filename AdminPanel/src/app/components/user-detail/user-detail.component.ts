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
    alert('User updated!');
  }

  async delete() {
    if (confirm('Are you sure you want to delete this user?')) {
      await this.userAdminService.deleteUser(this.userId, this.originalEmail);
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
}

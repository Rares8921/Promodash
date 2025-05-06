import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WithdrawalAdminService } from 'src/app/services/withdrawal-admin.service';

@Component({
  selector: 'app-withdrawal-detail',
  templateUrl: './withdrawal-detail.component.html',
  styleUrls: ['./withdrawal-detail.component.css']
})
export class WithdrawalDetailComponent implements OnInit {
  withdrawalForm: FormGroup;
  withdrawalId: string;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private withdrawalService: WithdrawalAdminService,
    private router: Router
  ) {
    this.withdrawalForm = this.fb.group({
      userId: [''],
      amount: [0],
      IBAN: [''],
      status: [''],
      transactionId: [''],
      createdAt: [''],
      updatedAt: ['']
    });
    this.withdrawalId = this.route.snapshot.paramMap.get('id')!;
  }

  async ngOnInit() {
    const withdrawal = await this.withdrawalService.getWithdrawalById(this.withdrawalId);
    this.withdrawalForm.patchValue(withdrawal);
    this.loading = false;
  }

  async save() {
    const formData = this.withdrawalForm.value;
    await this.withdrawalService.updateWithdrawal(this.withdrawalId, formData);
    alert('Withdrawal updated!');
  }

  async delete() {
    if (confirm('Are you sure you want to delete this withdrawal?')) {
      await this.withdrawalService.deleteWithdrawal(this.withdrawalId);
      alert('Withdrawal deleted!');
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

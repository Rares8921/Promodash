import { TestBed } from '@angular/core/testing';

import { WithdrawalAdminService } from './withdrawal-admin.service';

describe('WithdrawalAdminService', () => {
  let service: WithdrawalAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WithdrawalAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

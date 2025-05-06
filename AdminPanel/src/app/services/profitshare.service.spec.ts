import { TestBed } from '@angular/core/testing';

import { ProfitshareService } from './profitshare.service';

describe('ProfitshareService', () => {
  let service: ProfitshareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfitshareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

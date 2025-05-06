import { TestBed } from '@angular/core/testing';

import { ClickAdminService } from './click-admin.service';

describe('ClickAdminService', () => {
  let service: ClickAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

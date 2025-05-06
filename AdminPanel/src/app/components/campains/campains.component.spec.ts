import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampainsComponent } from './campains.component';

describe('CampainsComponent', () => {
  let component: CampainsComponent;
  let fixture: ComponentFixture<CampainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampainsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

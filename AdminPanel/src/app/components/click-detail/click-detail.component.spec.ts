import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickDetailComponent } from './click-detail.component';

describe('ClickDetailComponent', () => {
  let component: ClickDetailComponent;
  let fixture: ComponentFixture<ClickDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClickDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

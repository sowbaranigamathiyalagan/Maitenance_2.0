import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HodApproval } from './hod-approval';

describe('HodApproval', () => {
  let component: HodApproval;
  let fixture: ComponentFixture<HodApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HodApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(HodApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntimationSlip } from './intimation-slip';

describe('IntimationSlip', () => {
  let component: IntimationSlip;
  let fixture: ComponentFixture<IntimationSlip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntimationSlip],
    }).compileComponents();

    fixture = TestBed.createComponent(IntimationSlip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

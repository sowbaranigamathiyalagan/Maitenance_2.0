import { TestBed } from '@angular/core/testing';

import { Intimation } from './intimation';

describe('Intimation', () => {
  let service: Intimation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Intimation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

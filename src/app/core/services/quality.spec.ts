import { TestBed } from '@angular/core/testing';

import { Quality } from './quality';

describe('Quality', () => {
  let service: Quality;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Quality);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

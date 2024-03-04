import { TestBed } from '@angular/core/testing';

import { TrustService } from './trust.service';

describe('TrustService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrustService = TestBed.inject(TrustService);
    expect(service).toBeTruthy();
  });
});

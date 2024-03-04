import { TestBed } from '@angular/core/testing';

import { OneoffsService } from './oneoffs.service';

describe('OneoffsService', () => {
  let service: OneoffsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneoffsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

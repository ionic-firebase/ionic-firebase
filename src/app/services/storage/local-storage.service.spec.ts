import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
// import { Services } from '@angular/core/src/view';

describe('LocalStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalStorageService = TestBed.inject(LocalStorageService);
    expect(service).toBeTruthy();
  });
});

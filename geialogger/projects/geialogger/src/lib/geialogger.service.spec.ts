import { TestBed } from '@angular/core/testing';

import { GeialoggerService } from './geialogger.service';

describe('GeialoggerService', () => {
  let service: GeialoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeialoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

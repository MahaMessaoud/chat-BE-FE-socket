import { TestBed } from '@angular/core/testing';

import { RestauService } from './restau.service';

describe('RestauService', () => {
  let service: RestauService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestauService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

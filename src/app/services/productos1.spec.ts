import { TestBed } from '@angular/core/testing';

import { Productos1 } from './productos1';

describe('Productos1', () => {
  let service: Productos1;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Productos1);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

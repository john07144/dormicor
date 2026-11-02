import { TestBed } from '@angular/core/testing';

import { Buscador } from './buscador';

describe('Buscador', () => {
  let service: Buscador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Buscador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

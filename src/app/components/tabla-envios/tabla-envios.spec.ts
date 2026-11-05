import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaEnvios } from './tabla-envios';

describe('TablaEnvios', () => {
  let component: TablaEnvios;
  let fixture: ComponentFixture<TablaEnvios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaEnvios],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaEnvios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

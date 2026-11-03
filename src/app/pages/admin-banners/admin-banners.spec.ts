import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBanners } from './admin-banners';

describe('AdminBanners', () => {
  let component: AdminBanners;
  let fixture: ComponentFixture<AdminBanners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBanners],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBanners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

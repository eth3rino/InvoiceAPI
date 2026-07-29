import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelanceReference } from './freelance-reference';

describe('FreelanceReference', () => {
  let component: FreelanceReference;
  let fixture: ComponentFixture<FreelanceReference>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelanceReference],
    }).compileComponents();

    fixture = TestBed.createComponent(FreelanceReference);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

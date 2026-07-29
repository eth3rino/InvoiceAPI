import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevReference } from './dev-reference';

describe('DevReference', () => {
  let component: DevReference;
  let fixture: ComponentFixture<DevReference>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevReference],
    }).compileComponents();

    fixture = TestBed.createComponent(DevReference);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

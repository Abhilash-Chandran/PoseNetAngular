import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosenetLocalComponent } from './posenet-local.component';

describe('PosenetLocalComponent', () => {
  let component: PosenetLocalComponent;
  let fixture: ComponentFixture<PosenetLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosenetLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosenetLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

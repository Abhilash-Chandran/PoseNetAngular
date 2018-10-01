import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseVerifyComponent } from './pose-verify.component';

describe('PoseVerifyComponent', () => {
  let component: PoseVerifyComponent;
  let fixture: ComponentFixture<PoseVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoseVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoseVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

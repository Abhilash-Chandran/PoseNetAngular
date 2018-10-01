import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseListComponent } from './pose-list.component';

describe('PoseListComponent', () => {
  let component: PoseListComponent;
  let fixture: ComponentFixture<PoseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

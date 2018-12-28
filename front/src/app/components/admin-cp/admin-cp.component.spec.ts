import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCPComponent } from './admin-cp.component';

describe('AdminCPComponent', () => {
  let component: AdminCPComponent;
  let fixture: ComponentFixture<AdminCPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCPComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

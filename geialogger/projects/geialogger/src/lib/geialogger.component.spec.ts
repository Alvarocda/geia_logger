import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeialoggerComponent } from './geialogger.component';

describe('GeialoggerComponent', () => {
  let component: GeialoggerComponent;
  let fixture: ComponentFixture<GeialoggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeialoggerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeialoggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

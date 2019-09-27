import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TxtSqlComponent } from './txt-sql.component';

describe('TxtSqlComponent', () => {
  let component: TxtSqlComponent;
  let fixture: ComponentFixture<TxtSqlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxtSqlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxtSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

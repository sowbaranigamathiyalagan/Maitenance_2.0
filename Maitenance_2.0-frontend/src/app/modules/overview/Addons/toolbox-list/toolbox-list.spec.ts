import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolboxListComponent } from './toolbox-list';

describe('ToolboxList', () => {
  let component: ToolboxListComponent;
  let fixture: ComponentFixture<ToolboxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolboxListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolboxListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

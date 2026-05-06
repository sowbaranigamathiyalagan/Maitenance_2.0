import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolboxList } from './toolbox-list';

describe('ToolboxList', () => {
  let component: ToolboxList;
  let fixture: ComponentFixture<ToolboxList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolboxList],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolboxList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedPostComponent } from './created-post.component';

describe('CreatedPostComponent', () => {
  let component: CreatedPostComponent;
  let fixture: ComponentFixture<CreatedPostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreatedPostComponent]
    });
    fixture = TestBed.createComponent(CreatedPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

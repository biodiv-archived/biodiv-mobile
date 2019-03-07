import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Network } from "@ionic-native/network/ngx";

import { ToastStatusComponent } from "./toast-status.component";

describe("StatusSnackbarComponent", () => {
  let component: ToastStatusComponent;
  let fixture: ComponentFixture<ToastStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToastStatusComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        Network
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

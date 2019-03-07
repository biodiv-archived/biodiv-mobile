import { HttpClient, HttpHandler } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { AngularDelegate, ModalController, NavParams } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";

import { ObservationInfoAddModal } from "./observation-info-add.modal";

class MockNavParams {
  data = { obvIds: 0 };

  get(param) {
    return this.data[param];
  }
}

describe("ObservationInfoAddModal", () => {
  let component: ObservationInfoAddModal;
  let fixture: ComponentFixture<ObservationInfoAddModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [ObservationInfoAddModal],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ModalController,
        AngularDelegate,
        HttpClient,
        HttpHandler,
        HTTP,
        Network,
        File,
        { provide: NavParams, useClass: MockNavParams }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationInfoAddModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClient, HttpHandler } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { AngularDelegate, ModalController, NavParams } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "src/app/pipes/pipes.module";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { ObservationInfoPage } from "./observation-info.page";

class MockNavParams {
  data = { obvIds: 0 };

  get(param) {
    return this.data[param];
  }
}

class MockRouterStore {
  data = { id: 0 };

  getRouterStore() {
    return this.data;
  }

  get endpoint() {
    return "NANA";
  }
}

describe("ObservationInfoPage", () => {
  let component: ObservationInfoPage;
  let fixture: ComponentFixture<ObservationInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        PipesModule,
        IonicStorageModule.forRoot()
      ],
      declarations: [ObservationInfoPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        PhotoViewer,
        HttpClient,
        HttpHandler,
        HTTP,
        Network,
        File,
        ModalController,
        AngularDelegate,
        { provide: BasicUtilsService, useClass: MockRouterStore },
        { provide: NavParams, useClass: MockNavParams }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

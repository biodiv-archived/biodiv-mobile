import { HttpClient, HttpHandler } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { ImagePicker } from "@ionic-native/image-picker/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";

import { ObservationCreatePage } from "./observation-create.page";

describe("ObservationCreatePage", () => {
  let component: ObservationCreatePage;
  let fixture: ComponentFixture<ObservationCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        IonicStorageModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [ObservationCreatePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ImagePicker,
        WebView,
        HttpClient,
        HttpHandler,
        HTTP,
        Network,
        File
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

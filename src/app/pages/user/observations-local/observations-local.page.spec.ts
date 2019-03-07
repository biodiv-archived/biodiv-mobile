import { HttpClient, HttpHandler } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "src/app/pipes/pipes.module";

import { ObservationsLocalPage } from "./observations-local.page";

describe("ObservationsLocalPage", () => {
  let component: ObservationsLocalPage;
  let fixture: ComponentFixture<ObservationsLocalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        PipesModule,
        IonicStorageModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [ObservationsLocalPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [HttpClient, HttpHandler, HTTP, Network, File]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsLocalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

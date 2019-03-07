import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Platform } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";

import { AppComponent } from "./app.component";

// import { Component, OnInit } from "@angular/core";
// import { Router } from "@angular/router";
// import { Environment } from "@ionic-native/google-maps";

// import { UserDataService } from "./services/user-data/user-data.service";
// import { CookieService } from "./services/cookie/cookie.service";
// import { BasicUtilsService } from "./services/basic-utils/basic-utils.service";

describe("AppComponent", () => {
  let statusBarSpy,
    splashScreenSpy,
    platformReadySpy,
    platformSpy,
    component: AppComponent,
    fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    statusBarSpy = jasmine.createSpyObj("StatusBar", ["styleDefault", "backgroundColorByHexString", "overlaysWebView"]);
    splashScreenSpy = jasmine.createSpyObj("SplashScreen", ["hide"]);
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj("Platform", { ready: platformReadySpy });

    TestBed.configureTestingModule({
      imports: [
        IonicStorageModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        HTTP,
        Network,
        { provide: StatusBar, useValue: statusBarSpy },
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it("should create the app", async () => {
    expect(component).toBeTruthy();
  });

  it("should initialize the app", async () => {
    // TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(statusBarSpy.styleDefault).toHaveBeenCalled();
    expect(splashScreenSpy.hide).toHaveBeenCalled();
  });
});

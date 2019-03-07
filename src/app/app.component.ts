import { Component, OnInit } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Events, MenuController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

import { BasicUtilsService } from "./services/basic-utils/basic-utils.service";
import { UserDataService } from "./services/user-data/user-data.service";
import sidemenu from "./sidemenu.json";
import { GoogleAnalytics } from "@ionic-native/google-analytics/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent implements OnInit {
  public appPages = sidemenu;
  user;

  constructor(
    private appVersion: AppVersion,
    private ga: GoogleAnalytics,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private events: Events,
    private menuCtrl: MenuController,
    private userDataService: UserDataService,
    private router: Router,
    private basicUtilsService: BasicUtilsService
  ) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      this.setStatusBar();
      this.onPlatformReady();
      this.subscribeUserEvents();
      this.initI18n();
    });
  }

  async onPlatformReady() {
    this.splashScreen.hide();
    this.user = await this.userDataService.getUser();
    this.menuCtrl.enable((await this.userDataService.getUser()) ? true : false);
  }

  initI18n() {
    this.translate.setDefaultLang(
      this.basicUtilsService.environment.language.default
    );
    this.translate.use(this.basicUtilsService.environment.language.use);
  }

  subscribeUserEvents() {
    this.events.subscribe("user:loggedin", async () => {
      await this.userDataService.restoreTokensFromDb();
      this.user = await this.userDataService.getUser();
      this.startGoogleAnalytics();
      this.menuCtrl.enable(true);
      this.router.navigateByUrl("/user-observations");
    });
  }

  async startGoogleAnalytics() {
    const appVersion = await this.appVersion.getVersionNumber();
    this.ga
      .startTrackerWithId(this.basicUtilsService.environment.googleAnalyticsId)
      .then(() => {
        this.ga.setAppVersion(appVersion);
        this.ga.setUserId(this.user.id);
        this.ga.trackEvent("IBP_MOBILE", "APPLICATION_LAUNCHED");
        this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            this.ga.trackEvent("PAGE", event.url);
          }
        });
      })
      .catch(e => console.error("Error starting GoogleAnalytics", e));
  }

  setStatusBar() {
    const primaryShade = (<any>window)
      .getComputedStyle(document.body)
      .getPropertyValue("--ion-color-primary-shade");
    this.statusBar.styleDefault();
    this.statusBar.backgroundColorByHexString(primaryShade);
    this.statusBar.overlaysWebView(false);
  }
}

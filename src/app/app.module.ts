import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Camera } from "@ionic-native/camera/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { File } from "@ionic-native/file/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { GoogleAnalytics } from "@ionic-native/google-analytics/ngx";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { ImagePicker } from "@ionic-native/image-picker/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { NativeGeocoder } from "@ionic-native/native-geocoder/ngx";
import { Network } from "@ionic-native/network/ngx";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage";
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { IonicSelectableModule } from "ionic-selectable";
import { TranslateMessageFormatCompiler } from "ngx-translate-messageformat-compiler";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ToastStatusComponent } from "./components/toast-status/toast-status.component";
import { HttpAuthInterceptor } from "./interceptors/http-auth/http-auth.interceptor";
import { PipesModule } from "./pipes/pipes.module";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [AppComponent, ToastStatusComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    PipesModule,
    IonicSelectableModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: "__ibpdb",
      driverOrder: ["sqlite", "indexeddb", "websql", "localstorage"]
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      }
    }),
    AppRoutingModule
  ],
  providers: [
    AppVersion,
    Camera,
    File,
    FilePath,
    FileTransfer,
    Geolocation,
    GoogleAnalytics,
    GooglePlus,
    HTTP,
    ImagePicker,
    NativeGeocoder,
    Network,
    PhotoViewer,
    SplashScreen,
    StatusBar,
    WebView,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

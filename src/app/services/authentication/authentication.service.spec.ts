import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";

import { AuthenticationService } from "./authentication.service";

describe("AuthenticationService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [HttpClient, HttpHandler, HTTP, Network, GooglePlus]
    })
  );

  it("should be created", () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);
    expect(service).toBeTruthy();
  });
});

import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";

import { HttpRequestService } from "./http-request.service";

describe("HttpRequestService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [HttpClient, HttpHandler, HTTP, Network]
    })
  );

  it("should be created", () => {
    const service: HttpRequestService = TestBed.get(HttpRequestService);
    expect(service).toBeTruthy();
  });
});

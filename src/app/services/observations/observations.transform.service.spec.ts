import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";

import { ObservationsTransformService } from "./observations.transform.service";

describe("ObservationsTransformService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [HttpClient, HttpHandler, HTTP, Network, File]
    })
  );

  it("should be created", () => {
    const service: ObservationsTransformService = TestBed.get(
      ObservationsTransformService
    );
    expect(service).toBeTruthy();
  });
});

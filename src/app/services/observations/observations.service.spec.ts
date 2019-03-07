import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";
import { TranslateModule } from "@ngx-translate/core";

import { ObservationsService } from "./observations.service";

describe("ObservationsService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot(), TranslateModule.forRoot()],
      providers: [HttpClient, HttpHandler, HTTP, Network, File]
    })
  );

  it("should be created", () => {
    const service: ObservationsService = TestBed.get(ObservationsService);
    expect(service).toBeTruthy();
  });
});

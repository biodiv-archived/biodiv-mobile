import { HttpClient, HttpHandler } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { HTTP } from "@ionic-native/http/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";

import { GroupsService } from "./groups.service";

describe("GroupsService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [HttpClient, HttpHandler, HTTP, Network]
    })
  );

  it("should be created", () => {
    const service: GroupsService = TestBed.get(GroupsService);
    expect(service).toBeTruthy();
  });
});

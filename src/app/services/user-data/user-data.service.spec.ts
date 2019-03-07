import { TestBed } from "@angular/core/testing";
import { Network } from "@ionic-native/network/ngx";
import { IonicStorageModule } from "@ionic/storage";

import { UserDataService } from "./user-data.service";

describe("UserDataService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()],
      providers: [Network]
    })
  );

  it("should be created", () => {
    const service: UserDataService = TestBed.get(UserDataService);
    expect(service).toBeTruthy();
  });
});

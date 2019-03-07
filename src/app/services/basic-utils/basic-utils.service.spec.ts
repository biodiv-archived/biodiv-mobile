import { TestBed } from "@angular/core/testing";
import { IonicStorageModule } from "@ionic/storage";

import { BasicUtilsService } from "./basic-utils.service";

describe("BasicUtilsService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [IonicStorageModule.forRoot()]
    })
  );

  it("should be created", () => {
    const service: BasicUtilsService = TestBed.get(BasicUtilsService);
    expect(service).toBeTruthy();
  });
});

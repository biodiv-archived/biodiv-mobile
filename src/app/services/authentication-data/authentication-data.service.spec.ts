import { TestBed } from "@angular/core/testing";

import { AuthenticationDataService } from "./authentication-data.service";

describe("AuthenticationDataService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: AuthenticationDataService = TestBed.get(
      AuthenticationDataService
    );
    expect(service).toBeTruthy();
  });
});

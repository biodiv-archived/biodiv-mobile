import { inject } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";

import { SafePipe } from "./safe.pipe";

describe("SafePipe", () => {
  it("create an instance", inject(
    [DomSanitizer],
    (domSanitizer: DomSanitizer) => {
      const pipe = new SafePipe(domSanitizer);
      expect(pipe).toBeTruthy();
    }
  ));
});

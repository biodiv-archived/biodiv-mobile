import { Injectable } from "@angular/core";

import { UserDataService } from "../user-data/user-data.service";
import { BasicUtilsService } from "../basic-utils/basic-utils.service";

@Injectable({
  providedIn: "root"
})
export class AuthenticationDataService {
  constructor(
    private basicUtilsService: BasicUtilsService,
    private userDataService: UserDataService
  ) {}

  /**
   * Provides authentication headers
   * @returns JSON Object containing headers
   */
  getRequestOptionsHeaders(includeCT = true) {
    const headers = {
      "X-AppKey": this.basicUtilsService.environment.appKey,
      "X-Requested-With": "biodiv-app",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-H2C-BAToken": this.userDataService.getAccessToken(),
      "X-H2C-BRToken": this.userDataService.getRefreshToken()
    };
    if (!includeCT) {
      delete headers["Content-Type"];
    }
    return headers;
  }
}

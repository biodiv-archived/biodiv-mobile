import { Injectable } from "@angular/core";
import { GooglePlus } from "@ionic-native/google-plus/ngx";

import { BasicUtilsService } from "../../services/basic-utils/basic-utils.service";
import { HttpRequestService } from "../http-request/http-request.service";

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  constructor(
    private http: HttpRequestService,
    private googlePlus: GooglePlus,
    private basicUtilsService: BasicUtilsService
  ) {}

  /**
   * Verify user against plain credentials
   * @param username email
   * @param password
   * @returns JWT Token
   */
  public login(username: string, password: string) {
    const body = {
      username: username,
      password: password
    };

    return this.http.post("login/auth", body);
  }

  /**
   * Initiates google login
   * @returns authdata contains key for sending to callback endpoint
   */
  async loginGoogle(): Promise<any> {
    try {
      // await this.googlePlus.trySilentLogin();
      // await this.googlePlus.disconnect();
      // await this.googlePlus.logout();
      return await this.googlePlus.login({
        webClientId: this.basicUtilsService.environment.googleOauthClientId,
        offline: true
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Sends token to server as an callback
   * @param token
   * @returns Can be access token or user details if user is not registered to portal
   */
  async loginCallbackGoogle(token: string): Promise<any> {
    try {
      await this.basicUtilsService.showLoader();
      const body = {
        skipRedirect: true,
        code: token,
        client_name: "Google2Client"
      };
      this.basicUtilsService.hideLoader();
      return await this.http.get("login/callback", body).toPromise();
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  /**
   * Sends signup request to servers
   * @param formData
   * @returns Can be access token or user details if user is not registered to portal
   * @info If it's 200 that means registration is done successfully
   */
  async signup(f): Promise<any> {
    let errorText = `Error`;
    const signupForm = {
      email: f.email,
      "g-recaptcha-response": f.captcha,
      institutionType: f.institutionType.value,
      latitude: f.location.value.lat,
      longitude: f.location.value.lng,
      location: f.location.text,
      mapLocation: f.location.text,
      name: f.name,
      occupationType: f.occupationType.value,
      password: f.passwords["password"],
      password2: f.passwords["password2"],
      sexType: f.gender.value,
      webaddress: ""
    };
    try {
      await this.http.post("register", signupForm).toPromise();
      return { success: true };
    } catch (e) {
      console.error(e);
      if (Array.isArray(e.error)) {
        e.error.forEach(({ message, path }) => {
          errorText += `\n${path}: ${message}`;
        });
      }
    }
    return { success: false, errorText };
  }

  /**
   * Reset password
   * @param body
   * @returns JSON Object
   */
  public resetPassword(body): Promise<any> {
    return this.http.post("register/forgotPassword", body).toPromise();
  }
}

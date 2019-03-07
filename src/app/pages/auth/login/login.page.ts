import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Events } from "@ionic/angular";

import { AuthenticationService } from "../../../services/authentication/authentication.service";
import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { UserDataService } from "../../../services/user-data/user-data.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  user = {};
  showForm = false;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private events: Events,
    private userDataService: UserDataService,
    private basicUtilsService: BasicUtilsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    });
  }

  ionViewWillEnter() {
    this.checkUser();
  }

  async checkUser() {
    const isUser = (await this.userDataService.getUser()) ? true : false;
    if (isUser) {
      this.events.publish("user:loggedin");
    } else {
      this.showForm = true;
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    try {
      await this.basicUtilsService.showLoader();
      this.authenticationService
        .login(this.f.email.value, this.f.password.value)
        .subscribe(
          response => {
            this.authComplete(response);
          },
          error => {
            if (error.status === 403) {
              this.basicUtilsService.showToast(error.error.message);
            } else {
              console.error(error);
            }
          }
        );
    } finally {
      this.basicUtilsService.hideLoader();
    }
  }

  async doGoogleLogin() {
    const authData = await this.authenticationService.loginGoogle();
    const callbackData = await this.authenticationService.loginCallbackGoogle(
      authData.serverAuthCode
    );
    this.authComplete(callbackData);
  }

  /**
   * At the end of any authincation this router takes care of announcing that user is logged in
   * or redirects to signup with user data
   * @param response
   */
  async authComplete(response) {
    this.basicUtilsService.hideLoader();
    if (response.hasOwnProperty("access_token")) {
      await this.userDataService.setAccessToken(response["access_token"]);
      await this.userDataService.setRefreshToken(response["refresh_token"]);
      this.events.publish("user:loggedin");
      return;
    }
    this.basicUtilsService.setRouterStore(response);
    this.router.navigate(["/signup"]);
  }
}

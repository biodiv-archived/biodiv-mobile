import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "src/app/services/authentication/authentication.service";
import { BasicUtilsService } from "src/app/services/basic-utils/basic-utils.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.page.html",
  styleUrls: ["./forgot-password.page.scss"]
})
export class ForgotPasswordPage implements OnInit {
  resetForm: FormGroup;
  submitted = false;
  recaptchaKey = this.basicUtilsService.environment.recaptchaKey;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private translateService: TranslateService,
    private basicUtilsService: BasicUtilsService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      "g-recaptcha-response": ["", Validators.required]
    });
  }

  async onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid) {
      return;
    }

    const sResponse = await this.authenticationService.resetPassword(
      this.resetForm.value
    );

    if (sResponse.success) {
      this.redirectToLogin();
    } else {
      console.error(sResponse);
      this.basicUtilsService.showToast(sResponse.error.message);
    }
  }

  get f() {
    return this.resetForm.controls;
  }

  async redirectToLogin() {
    const alert = await this.alertController.create({
      header: this.translateService.instant("RESET.RESET_SUCCESS_HEADER"),
      message: this.translateService.instant("RESET.RESET_SUCCESS_MESSAGE"),
      buttons: [
        {
          text: this.translateService.instant("SIGNUP.OKAY"),
          handler: () => {
            this.router.navigateByUrl("/login");
          }
        }
      ]
    });

    await alert.present();
  }
}

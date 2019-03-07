import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IonicSelectableModule } from "ionic-selectable";
import { NgxCaptchaModule } from "ngx-captcha";

import { SignupPage } from "./signup.page";

const routes: Routes = [
  {
    path: "",
    component: SignupPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    IonicSelectableModule
  ],
  declarations: [SignupPage]
})
export class SignupPageModule {}

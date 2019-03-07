import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IonicSelectableModule } from "ionic-selectable";

import { ObservationCreatePage } from "./observation-create.page";

const routes: Routes = [
  {
    path: "",
    component: ObservationCreatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicSelectableModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ObservationCreatePage]
})
export class ObservationCreatePageModule {}
